import React, { useState, useMemo } from 'react';
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
import styles from './KpiChartBySubject.module.scss';
import RadioDropdown from './RadioDropdown';
import CheckboxDropdown from './CheckboxDropdown';
import { FaCalendarAlt, FaGraduationCap } from 'react-icons/fa';

// --- CONSTANTS ---
// Đã xóa PROGRAMS vì được control từ cha

const TIME_OPTIONS = [
    { label: 'Giữa kỳ I (Q1)', value: 'Q1' },
    { label: 'Cuối kỳ I (Q2)', value: 'Q2' },
    { label: 'Giữa kỳ II (Q3)', value: 'Q3' },
    { label: 'Cuối kỳ II (Q4)', value: 'Q4' },
    { label: 'Học kỳ I (HK1)', value: 'HK1' },
    { label: 'Học kỳ II (HK2)', value: 'HK2' },
    { label: 'Cả năm (Year)', value: 'YEAR' }
];

// Tạo danh sách Khối 1 -> 12
const GRADE_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
    label: `Khối ${i + 1}`,
    value: i + 1
}));

// --- SUBJECT LISTS ---
const TDS_SUBJECTS = [
    "TIẾNG VIỆT", "VN TOÁN", "ENGLISH", "EN MATH", "EN SCIENCE",
    "VN KHTN", "VN LỊCH SỬ", "VN ĐỊA LÝ", "VN GDCD", "VN TIN HỌC"
];

const MOET_SUBJECTS = [
    "TOÁN", "NGỮ VĂN", "TIẾNG VIỆT", "KHTN", "LỊCH SỬ", "ĐỊA LÝ", "GDCD"
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const KpiChartBySubject = ({ kpiName, kpiType = 'TDS', program = 'Discover' }) => {

    // --- 1. LOCAL STATE ---
    // Xóa state selectedProgram
    const [selectedTimes, setSelectedTimes] = useState(['Q1']);
    const [selectedGrade, setSelectedGrade] = useState(6); // Mặc định chọn khối 6

    // --- 2. PREPARE SUBJECT LIST ---
    const currentSubjects = useMemo(() => {
        return kpiType.includes('MOET') ? MOET_SUBJECTS : TDS_SUBJECTS;
    }, [kpiType]);

    // --- 3. MOCK DATA GENERATOR ---
    const chartData = useMemo(() => {
        // Logic giả lập: Chương trình Adventure/Journey yêu cầu cao hơn chút
        let programBonus = 0;
        if (program === 'Adventure') programBonus = 1.5;
        if (program === 'Journey') programBonus = 3.0;

        const baseTargets = {
            Q1: 75 + programBonus,
            Q2: 78 + programBonus,
            Q3: 80 + programBonus,
            Q4: 82 + programBonus,
            HK1: 77 + programBonus,
            HK2: 81 + programBonus,
            YEAR: 85 + programBonus
        };

        // Map qua danh sách MÔN HỌC để tạo từng điểm trên trục X
        return currentSubjects.map((subject) => {
            const subjectData = {
                name: subject,
            };

            selectedTimes.forEach(time => {
                // 1. Thực tế (Bar):
                const difficultyFactor = (subject.includes('TOÁN') || subject.includes('MATH')) ? -5 : 0;
                // Random điểm thực tế, cộng thêm chút điểm nếu chương trình cao hơn (giả lập học sinh giỏi hơn)
                let actual = Math.floor(Math.random() * (98 - 65 + 1)) + 65 + difficultyFactor + (program === 'Discover' ? 0 : 2);
                if(actual > 100) actual = 100;
                subjectData[time] = actual;

                // 2. KPI Target (Line):
                const randomFluctuation = Math.random() * 3;
                let targetVal = (baseTargets[time] || 80) + randomFluctuation;

                // Cap max 100
                if (targetVal > 100) targetVal = 100;
                subjectData[`${time}_Target`] = parseFloat(targetVal.toFixed(1));
            });

            return subjectData;
        });
    }, [selectedTimes, program, selectedGrade, currentSubjects]); // Thêm program vào dependency

    // --- 4. CUSTOM TOOLTIP ---
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={styles.customTooltip}>
                    <p className={styles.tooltipLabel}>{label}</p>
                    {payload.map((entry, index) => {
                        const isTarget = entry.dataKey.includes('_Target');
                        const realName = entry.dataKey.replace('_Target', '');
                        return (
                            <div key={index} style={{ color: entry.color, fontSize: '12px', marginBottom: '4px' }}>
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
                <h3>2. Báo cáo hoàn thành KPI{kpiName} theo Môn học</h3>
            </div>
            {/* --- CONTROLS --- */}
            <div className={styles.chartControls}>
                {/* ĐÃ XÓA CONTROL CHỌN PROGRAM */}

                {/* Chọn Thời gian */}
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

                {/* Chọn Khối */}
                <div className={styles.controlGroup}>
                    <div className={styles.label}><FaGraduationCap/> Chọn khối:</div>
                    <RadioDropdown
                        className={styles.dropdown}
                        options={GRADE_OPTIONS}
                        value={selectedGrade}
                        onChange={setSelectedGrade}
                        placeholder="Chọn khối"
                    />
                </div>
            </div>

            {/* --- CHART AREA --- */}
            <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={500}>
                    <ComposedChart
                        data={chartData}
                        margin={{top: 20, right: 30, left: 0, bottom: 60}}
                        barGap={4}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaecf0"/>

                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{fill: '#667085', fontSize: 11}}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
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
                                    {/* Bar: Thực tế */}
                                    <Bar
                                        dataKey={time}
                                        fill={color}
                                        name={`Thực tế ${time}`}
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={30}
                                        fillOpacity={0.85}
                                    />

                                    {/* Line: KPI Target */}
                                    <Line
                                        type="monotone"
                                        dataKey={`${time}_Target`}
                                        name={`KPI ${time}`}
                                        stroke={color}
                                        strokeWidth={2}
                                        dot={{r: 3, fill: '#fff', stroke: color, strokeWidth: 2}}
                                        activeDot={{r: 5}}
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

export default KpiChartBySubject;