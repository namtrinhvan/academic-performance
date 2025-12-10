import React, {useState, useMemo, useEffect} from 'react';
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import styles from './KpiChartByGrade.module.scss';
import RadioDropdown from './RadioDropdown';
import CheckboxDropdown from './CheckboxDropdown';
import {FaCalendarAlt, FaBook} from 'react-icons/fa';

// --- CONSTANTS ---
// Đã xóa PROGRAMS vì được control từ cha
const TIME_OPTIONS = [
    {label: 'Giữa kỳ I (Q1)', value: 'Q1'},
    {label: 'Cuối kỳ I (Q2)', value: 'Q2'},
    {label: 'Giữa kỳ II (Q3)', value: 'Q3'},
    {label: 'Cuối kỳ II (Q4)', value: 'Q4'},
    {label: 'Học kỳ I (HK1)', value: 'HK1'},
    {label: 'Học kỳ II (HK2)', value: 'HK2'},
    {label: 'Cả năm (Year)', value: 'YEAR'}
];

const TDS_SUBJECTS = [
    "TIẾNG VIỆT", "VN TOÁN", "ENGLISH", "EN MATHEMATICS", "EN SCIENCE", "VN KHOA HỌC TỰ NHIÊN"
];
const MOET_SUBJECTS = ["TOÁN", "NGỮ VĂN", "TIẾNG VIỆT", "KHOA HỌC TỰ NHIÊN", "LỊCH SỬ"];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const KpiChartByGrade = ({kpiName, kpiType = 'TDS', program = 'Discover'}) => {

    // --- 1. LOCAL STATE ---
    // Đã xóa state selectedProgram
    const [selectedTimes, setSelectedTimes] = useState(['Q1']);
    const [selectedSubject, setSelectedSubject] = useState('');

    // --- 2. PREPARE SUBJECT DATA ---
    const currentSubjects = useMemo(() => {
        return kpiType.includes('MOET') ? MOET_SUBJECTS : TDS_SUBJECTS;
    }, [kpiType]);

    const subjectOptions = useMemo(() => {
        return currentSubjects.map(s => ({label: s, value: s}));
    }, [currentSubjects]);

    useEffect(() => {
        if (currentSubjects.length > 0) {
            setSelectedSubject(currentSubjects[0]);
        }
    }, [currentSubjects]);

    // --- 3. MOCK DATA GENERATOR ---
    const chartData = useMemo(() => {
        const data = [];

        // Base KPI targets: Điều chỉnh nhẹ dựa trên program để thấy sự khác biệt
        let baseBonus = 0;
        if (program === 'Adventure') baseBonus = 2;
        if (program === 'Journey') baseBonus = 4;

        const baseTargets = {
            Q1: 75 + baseBonus,
            Q2: 78 + baseBonus,
            Q3: 80 + baseBonus,
            Q4: 82 + baseBonus,
            HK1: 77 + baseBonus,
            HK2: 81 + baseBonus,
            YEAR: 85 + baseBonus
        };

        for (let i = 1; i <= 12; i++) {
            const gradeData = {
                name: `Khối ${i}`,
            };

            selectedTimes.forEach(time => {
                // 1. Dữ liệu Thực tế (Bar): Random 60 - 95
                // Thêm chút biến thiên theo program cho sinh động
                const randomVal = Math.floor(Math.random() * (95 - 60 + 1)) + 60;
                gradeData[time] = Math.min(100, randomVal + (program === 'Discover' ? 0 : 3));

                // 2. Dữ liệu KPI Target (Line):
                const growthFactor = (i * 0.8);
                const randomFluctuation = Math.random() * 2;
                let targetVal = (baseTargets[time] || 80) + growthFactor + randomFluctuation;

                if (targetVal > 100) targetVal = 100;
                gradeData[`${time}_Target`] = parseFloat(targetVal.toFixed(1));
            });

            data.push(gradeData);
        }
        return data;
    }, [selectedTimes, program, selectedSubject]); // Thêm 'program' vào dependency

    // --- 4. RENDER HELPERS ---
    const CustomTooltip = ({active, payload, label}) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: '#fff',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                    <p style={{fontWeight: 'bold', marginBottom: '5px'}}>{label}</p>
                    {payload.map((entry, index) => {
                        const isTarget = entry.dataKey.includes('_Target');
                        const realName = entry.dataKey.replace('_Target', '');
                        return (
                            <div key={index} style={{color: entry.color, fontSize: '13px', marginBottom: '3px'}}>
                                {isTarget ? `KPI ${realName}` : `Thực tế ${realName}`}: <strong>{entry.value}%</strong>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    // --- 5. RENDER ---
    return (
        <div className={styles.chartWrapper}>
            <div className={styles.chartHeader}>
                <h3>1. Báo cáo hoàn thành KPI{kpiName} theo Khối</h3>
            </div>
            {/* --- CONTROLS --- */}
            <div className={styles.chartControls}>
                {/* ĐÃ XÓA CONTROL CHỌN PROGRAM VÌ ĐÃ CÓ Ở CHA */}

                <div className={styles.controlGroup}>
                    <div className={styles.label}><FaCalendarAlt/> Thời gian:</div>
                    <CheckboxDropdown
                        className={styles.dropdown}
                        options={TIME_OPTIONS}
                        value={selectedTimes}
                        onChange={setSelectedTimes}
                        placeholder="Chọn các kỳ..."
                        maxDisplayTags={2}
                    />
                </div>
                <div className={styles.separator}></div>
                <div className={styles.controlGroup}>
                    <div className={styles.label}><FaBook/> Môn học:</div>
                    <RadioDropdown
                        className={styles.dropdown}
                        options={subjectOptions}
                        value={selectedSubject}
                        onChange={setSelectedSubject}
                    />
                </div>
            </div>

            {/* --- CHART AREA --- */}
            <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={450}>
                    <ComposedChart
                        data={chartData}
                        margin={{top: 20, right: 30, left: 0, bottom: 5}}
                        barGap={4}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaecf0"/>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{fill: '#667085', fontSize: 12}}
                            dy={10}
                        />
                        <YAxis
                            unit="%"
                            axisLine={false}
                            tickLine={false}
                            tick={{fill: '#667085', fontSize: 12}}
                            domain={[0, 100]}
                        />
                        <Tooltip content={<CustomTooltip/>}/>
                        <Legend layout="horizontal"
                                verticalAlign="top"
                                align="center" wrapperStyle={{paddingBottom: '30px'}}/>

                        {selectedTimes.map((time, index) => {
                            const color = COLORS[index % COLORS.length];
                            return (
                                <React.Fragment key={time}>
                                    <Bar
                                        dataKey={time}
                                        fill={color}
                                        name={`Thực tế ${time}`}
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={40}
                                        fillOpacity={0.8}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey={`${time}_Target`}
                                        name={`KPI ${time}`}
                                        stroke={color}
                                        strokeWidth={2}
                                        dot={{r: 2, fill: '#fff', stroke: color, strokeWidth: 1}}
                                        activeDot={{r: 3}}
                                    />
                                </React.Fragment>
                            );
                        })}
                    </ComposedChart>
                </ResponsiveContainer>

                {selectedTimes.length === 0 && (
                    <div className={styles.noDataOverlay}>
                        Vui lòng chọn ít nhất một mốc thời gian để xem biểu đồ.
                    </div>
                )}
            </div>
        </div>
    );
};

export default KpiChartByGrade;