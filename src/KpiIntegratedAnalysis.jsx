import React, {useState, useMemo, useEffect} from 'react';
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import {FaLayerGroup, FaCalendarAlt, FaExclamationTriangle, FaChartBar} from 'react-icons/fa';
import styles from './KpiIntegratedAnalysis.module.scss';
import RadioDropdown from './RadioDropdown';

// --- CONSTANTS ---
const TIME_OPTIONS = [
    {label: 'Giữa kỳ I (Q1)', value: 'Q1'},
    {label: 'Cuối kỳ I (Q2)', value: 'Q2'},
    {label: 'Cuối kỳ II (Q4)', value: 'Q4'},
    {label: 'Cả năm (Year)', value: 'YEAR'}
];

const PROGRAM_OPTIONS = [
    {label: 'Discover', value: 'Discover'},
    {label: 'Adventure', value: 'Adventure'},
    {label: 'Journey', value: 'Journey'}
];

const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const SUBJECTS = ["VN TOÁN", "NGỮ VĂN", "ENGLISH", "KHTN", "LỊCH SỬ", "ĐỊA LÝ", "VẬT LÝ", "HÓA HỌC"];

// Danh sách Focal Point mẫu cho VN TOÁN (để demo đẹp)
const MATH_FOCAL_POINTS = [
    "Thống kê và xác suất", "Hình học (không gian)",
    "Đại số và Giải tích", "Hình học và đo lường"
];

const KpiIntegratedAnalysis = () => {
    // --- STATE ---
    const [selectedTime, setSelectedTime] = useState('Q1');
    const [selectedProgram, setSelectedProgram] = useState('Discover');

    // State cho interaction: Lưu data của ô đang được chọn
    const [activeCell, setActiveCell] = useState(null);
    const [hoveredCell, setHoveredCell] = useState(null); // Cho tooltip hover

    // --- MOCK DATA GENERATOR (Single Source of Truth) ---
    const gridData = useMemo(() => {
        return SUBJECTS.map(subject => {
            return {
                subjectName: subject,
                gradesData: GRADES.map(grade => {
                    // 1. Config logic
                    const target = 80;
                    const isMath = subject === 'VN TOÁN';

                    // 2. Generate Focal Points
                    // Nếu là toán thì lấy tên thật, ko thì random tên chung chung
                    const pointNames = isMath ? MATH_FOCAL_POINTS : Array.from({length: 4}, (_, i) => `${subject} FP ${i + 1}`);

                    const focalPoints = pointNames.map((name, i) => {
                        const isFail = Math.random() < 0.2; // 20% chance fail
                        const score = isFail
                            ? Math.floor(Math.random() * (79 - 50) + 50)
                            : Math.floor(Math.random() * (100 - 80) + 80);
                        return {id: i, name, score, target, isPassed: score >= target};
                    });

                    // 3. Avg Score
                    const avgScore = Math.round(focalPoints.reduce((acc, curr) => acc + curr.score, 0) / focalPoints.length);

                    return {
                        id: `${subject}-${grade}`, // Unique ID for selection
                        grade,
                        subject,
                        avgScore,
                        target,
                        isSubjectPassed: avgScore >= target,
                        focalPoints
                    };
                })
            };
        });
    }, [selectedTime, selectedProgram]);

    // Auto-select ô đầu tiên khi data thay đổi hoặc mount
    useEffect(() => {
        if (gridData.length > 0 && gridData[0].gradesData.length > 0) {
            setActiveCell(gridData[0].gradesData[0]);
        }
    }, [gridData]);



    // --- HELPER: Grid Tooltip ---
    const renderGridTooltip = () => {
        if (!hoveredCell) return null;
        const {data, x, y} = hoveredCell;
        return (
            <div className={styles.tooltipCard} style={{top: y + 20, left: x + 20}}>
                <div className={styles.tooltipHeader}>
                    <strong>{data.subject} - Khối {data.grade}</strong>
                    <span className={data.isSubjectPassed ? styles.tagPass : styles.tagFail}>
                        {data.avgScore}% / {data.target}% KPI
                    </span>
                </div>
                <div className={styles.tooltipBody}>
                    <div className={styles.tooltipHint}>Click để xem chi tiết biểu đồ</div>
                    {/* Chỉ hiện 3 FP đầu tiên trong tooltip để đỡ dài */}
                    {data.focalPoints.slice(0, 3).map((fp) => (
                        <div key={fp.id} className={styles.fpRow}>
                            <span className={styles.fpName}>{fp.name}</span>
                            <div className={styles.fpValueGroup}>
                                <div className={styles.miniProgress}>
                                    <div className={`${styles.fill} ${fp.isPassed ? styles.pass : styles.fail}`}
                                         style={{width: `${fp.score}%`}}></div>
                                </div>
                                <span
                                    className={`${styles.scoreNum} ${!fp.isPassed ? styles.textFail : ''}`}>{fp.score}</span>
                            </div>
                        </div>
                    ))}
                    {data.focalPoints.length > 3 &&
                        <div className={styles.moreLabel}>...và {data.focalPoints.length - 3} chỉ số khác</div>}
                </div>
            </div>
        );
    };

    // --- HELPER: Chart Tooltip ---
    const CustomChartTooltip = ({active, payload, label}) => {
        if (active && payload && payload.length) {
            return (
                <div className={styles.chartTooltip}>
                    <p className={styles.label}>{label}</p>
                    <div className={styles.row} style={{color: '#0088FE'}}>
                        Thực tế: <strong>{payload[0].value}%</strong>
                    </div>
                    <div className={styles.row} style={{color: '#FF8042'}}>
                        Mục tiêu: <strong>{payload[1].value}%</strong>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.titleGroup}>
                <h3>4. Chi tiết KPI</h3>
            </div>
            <div className={styles.controlSection}>
                <div className={styles.controls}>
                    <div className={styles.controlGroup}>
                        <div className={styles.label}>Thời gian:</div>
                        <RadioDropdown options={TIME_OPTIONS} value={selectedTime} onChange={setSelectedTime}
                                       className={styles.dropdown}/>
                    </div>
                </div>
            </div>
            <div className={styles.charts}>
                <div className={styles.heatmapContainer}>


                    <div className={styles.legendBar}>
                        <div className={styles.legendItem}><span className={styles.boxFail}></span><span>Không đạt KPI Môn</span>
                        </div>
                        <div className={styles.legendItem}><span className={styles.dotFail}></span><span>Focal Point yếu</span>
                        </div>
                        <div className={styles.legendItem}><span className={styles.dotPass}></span><span>Focal Point tốt</span>
                        </div>
                    </div>

                    <div className={styles.gridWrapper}>
                        <table className={styles.gridTable}>
                            <thead>
                            <tr>
                                <th className={styles.stickyCol}>Môn học \ Khối</th>
                                {GRADES.map(g => <th key={g}>Khối {g}</th>)}
                            </tr>
                            </thead>
                            <tbody>
                            {gridData.map((row, rIndex) => (
                                <tr key={rIndex}>
                                    <td className={styles.stickyCol}>
                                        <div className={styles.subjectLabel}>{row.subjectName}</div>
                                    </td>
                                    {row.gradesData.map((cellData) => (
                                        <td key={cellData.id} className={styles.cellContainer}>
                                            <div
                                                className={`
                                                    ${styles.cellContent} 
                                                    ${!cellData.isSubjectPassed ? styles.cellFail : ''}
                                                    ${activeCell?.id === cellData.id ? styles.cellActive : ''}
                                                `}
                                                onClick={() => setActiveCell(cellData)}
                                                onMouseMove={(e) => setHoveredCell({
                                                    data: cellData,
                                                    x: e.clientX,
                                                    y: e.clientY
                                                })}
                                                onMouseLeave={() => setHoveredCell(null)}
                                            >
                                                <div className={styles.cellHeader}>
                                                    <span className={styles.avgScore}>{cellData.avgScore}%</span>
                                                    {!cellData.isSubjectPassed &&
                                                        <FaExclamationTriangle className={styles.warningIcon}/>}
                                                </div>
                                                <div className={styles.focalPointGrid}>
                                                    {cellData.focalPoints.map(fp => (
                                                        <div key={fp.id}
                                                             className={`${styles.fpDot} ${fp.isPassed ? styles.pass : styles.fail}`}></div>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    {hoveredCell && <div className={styles.tooltipPortal}>{renderGridTooltip()}</div>}
                </div>
                {activeCell && (
                    <div className={styles.chartSection}>
                        <div className={styles.chartHeader}>
                            <div className={styles.chartTitleInfo}>
                                <div>
                                    <h4>Chi tiết Focal Point: {activeCell.subject} - Khối {activeCell.grade}</h4>
                                    <span
                                        className={styles.subInfo}>{TIME_OPTIONS.find(t => t.value === selectedTime)?.label}: <strong
                                        style={{color: activeCell.isSubjectPassed ? '#12b76a' : '#f04438'}}>{activeCell.avgScore}%</strong></span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.chartBody}>
                            <ResponsiveContainer width="100%" height={350}>
                                <ComposedChart data={activeCell.focalPoints}
                                               margin={{top: 20, right: 30, left: 20, bottom: 60}}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaecf0"/>
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{fill: '#667085', fontSize: 11}}
                                        angle={-15}
                                        textAnchor="end"
                                        interval={0}
                                    />
                                    <YAxis unit="%" axisLine={false} tickLine={false} domain={[0, 100]}/>
                                    <RechartsTooltip content={<CustomChartTooltip/>}/>
                                    <Legend verticalAlign="top" wrapperStyle={{paddingBottom: '20px'}}/>

                                    <Bar dataKey="score" name="Thực tế" radius={[4, 4, 0, 0]} maxBarSize={50}>
                                        {activeCell.focalPoints.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.isPassed ? '#0088FE' : '#f04438'}/>
                                        ))}
                                    </Bar>
                                    <Line type="monotone" dataKey="target" name="KPI Target" stroke="#FF8042"
                                          strokeWidth={2} dot={{r: 4}}/>
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KpiIntegratedAnalysis;