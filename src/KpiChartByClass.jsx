import React, {useState, useMemo} from 'react';
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
import styles from './KpiChartByClass.module.scss';
import RadioDropdown from './RadioDropdown';
import CheckboxDropdown from './CheckboxDropdown';
import {FaCalendarAlt, FaLayerGroup, FaChalkboardTeacher, FaUserGraduate} from 'react-icons/fa';

// --- CONSTANTS ---
const TIME_OPTIONS = [
    {label: 'Giữa kỳ I (Q1)', value: 'Q1'},
    {label: 'Cuối kỳ I (Q2)', value: 'Q2'},
    {label: 'Giữa kỳ II (Q3)', value: 'Q3'},
    {label: 'Cuối kỳ II (Q4)', value: 'Q4'},
    {label: 'Học kỳ I (HK1)', value: 'HK1'},
    {label: 'Học kỳ II (HK2)', value: 'HK2'},
    {label: 'Cả năm (Year)', value: 'YEAR'}
];

const PROGRAM_OPTIONS = [
    {label: 'Tất cả hệ', value: 'ALL'},
    {label: 'Hệ Nâng cao (Adventure)', value: 'Adventure'},
    {label: 'Hệ Song ngữ (Journey)', value: 'Journey'},
    {label: 'Hệ Quốc tế (Discover)', value: 'Discover'}
];

const GRADE_OPTIONS = Array.from({length: 12}, (_, i) => ({
    label: `Khối ${i + 1}`,
    value: i + 1
}));

// Mock danh sách lớp theo hệ
const CLASS_SUFFIXES = ['A1', 'A2', 'A3', 'B1', 'B2', 'D1', 'D2'];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const KpiChartByClass = ({kpiName = "KPI Học tập", kpiType = 'TDS', program = 'Discover'}) => {
    // --- STATE ---
    const [selectedTimes, setSelectedTimes] = useState(['Q1']); // Mặc định so sánh Q1 vs Q2
    const [selectedGrade, setSelectedGrade] = useState(10); // Mặc định Khối 10
    const [selectedProgram, setSelectedProgram] = useState('ALL');

    // --- MOCK DATA GENERATOR ---
    const chartData = useMemo(() => {
        // 1. Tạo danh sách lớp giả lập dựa trên Khối đã chọn
        // Ví dụ: Khối 10 -> 10A1, 10A2, 10B1...
        let classes = CLASS_SUFFIXES.map(suffix => ({
            className: `${selectedGrade}${suffix}`,
            // Giả lập hệ dựa trên tên lớp (A=Adventure, B=Journey, D=Discover)
            program: suffix.startsWith('A') ? 'Adventure' : (suffix.startsWith('B') ? 'Journey' : 'Discover'),
            teacher: `GV. Nguyễn Văn ${suffix}`
        }));

        // 2. Filter theo Program nếu user chọn cụ thể
        if (selectedProgram !== 'ALL') {
            classes = classes.filter(cls => cls.program === selectedProgram);
        }

        const baseTargets = {
            Q1: 75, Q2: 78, Q3: 80, Q4: 82,
            HK1: 77, HK2: 81, YEAR: 85
        };

        // 3. Map data vào từng lớp
        return classes.map(cls => {
            const rowData = {
                name: cls.className,
                program: cls.program,
                teacher: cls.teacher,
                totalStudents: 25 + Math.floor(Math.random() * 10) // 25-35 học sinh
            };

            selectedTimes.forEach(time => {
                // Logic Random điểm số:
                // Hệ Journey/Discover (B/D) thường điểm cao hơn chút so với Adventure (A) giả định
                const programBonus = cls.program === 'Discover' ? 3 : (cls.program === 'Journey' ? 1.5 : 0);

                // Điểm thực tế
                let actual = Math.floor(Math.random() * (95 - 65 + 1)) + 65 + programBonus;
                if (actual > 100) actual = 100;

                // KPI Target (Line)
                const fluctuation = (Math.random() * 2) - 1;
                let targetVal = baseTargets[time] + fluctuation + programBonus;

                rowData[time] = actual;
                rowData[`${time}_Target`] = parseFloat(targetVal.toFixed(1));
            });

            return rowData;
        });
    }, [selectedTimes, selectedGrade, selectedProgram]);

    // --- CUSTOM TOOLTIP ---
    const CustomTooltip = ({active, payload, label}) => {
        if (active && payload && payload.length) {
            const meta = payload[0].payload; // Lấy thông tin meta (GV, sĩ số)
            return (
                <div className={styles.customTooltip}>
                    <div className={styles.tooltipHeader}>Lớp {label}</div>
                    <div className={styles.tooltipSubInfo}>
                        <div><FaLayerGroup size={10}/> Hệ: {meta.program}</div>
                        <div><FaChalkboardTeacher size={10}/> {meta.teacher}</div>
                        <div><FaUserGraduate size={10}/> Sĩ số: {meta.totalStudents}</div>
                    </div>
                    <div className={styles.divider}></div>
                    {payload.map((entry, index) => {
                        const isTarget = entry.dataKey.includes('_Target');
                        const timeLabel = entry.dataKey.replace('_Target', '');
                        return (
                            <div key={index} className={styles.tooltipRow} style={{color: entry.color}}>
                                <span className={styles.rowLabel}>
                                    {isTarget ? `KPI ${timeLabel}` : `Thực tế ${timeLabel}`}:
                                </span>
                                <span className={styles.rowValue}>{entry.value}%</span>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    return (
        <div className={styles.chartWrapper}>
            <div className={styles.chartHeader}>
                <div className={styles.titleBlock}>
                    <h3>3. Báo cáo hoàn thành KPI{kpiName} theo Lớp</h3>
                </div>
            </div>

            {/* --- CONTROLS --- */}
            <div className={styles.chartControls}>
                {/* 2. Chọn Thời gian (So sánh nhiều kỳ) */}
                <div className={styles.controlGroup}>
                    <div className={styles.label}>Thời gian:</div>
                    <CheckboxDropdown
                        className={styles.dropdown}
                        options={TIME_OPTIONS}
                        value={selectedTimes}
                        onChange={setSelectedTimes}
                        placeholder="Chọn các kỳ..."
                        maxDisplayTags={2}
                    />
                </div>
                <div className={styles.controlGroup}>
                    <div className={styles.label}>Chọn Khối:</div>
                    <RadioDropdown
                        className={styles.dropdownShort}
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
                        margin={{top: 20, right: 30, left: 0, bottom: 40}}
                        barGap={6} // Khoảng cách giữa các cột trong cùng 1 nhóm
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaecf0"/>

                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{fill: '#667085', fontSize: 12, fontWeight: 500}}
                            dy={10}
                        />

                        <YAxis
                            unit="%"
                            axisLine={false}
                            tickLine={false}
                            tick={{fill: '#667085', fontSize: 12}}
                            domain={[0, 100]}
                        />

                        <Tooltip content={<CustomTooltip/>} cursor={{fill: 'rgba(0,0,0,0.03)'}}/>
                        <Legend
                            layout="horizontal"
                            verticalAlign="top"
                            align="right"
                            wrapperStyle={{paddingBottom: '20px'}}
                        />

                        {/* Dynamic Rendering Bars & Lines based on selection */}
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
                                        maxBarSize={40} // Cột to hơn chút
                                    />

                                    {/* Line: Target */}
                                    <Line
                                        type="monotone"
                                        dataKey={`${time}_Target`}
                                        name={`KPI ${time}`}
                                        stroke={color}
                                        strokeWidth={2}
                                        strokeDasharray="5 5" // Nét đứt để phân biệt Target
                                        dot={{r: 4, fill: '#fff', stroke: color, strokeWidth: 2}}
                                        activeDot={{r: 6}}
                                    />
                                </React.Fragment>
                            );
                        })}
                    </ComposedChart>
                </ResponsiveContainer>

                {/* Empty State Handlers */}
                {selectedTimes.length === 0 && (
                    <div className={styles.noDataOverlay}>Vui lòng chọn thời gian để xem biểu đồ.</div>
                )}
                {chartData.length === 0 && selectedTimes.length > 0 && (
                    <div className={styles.noDataOverlay}>Không tìm thấy lớp học nào phù hợp với bộ lọc.</div>
                )}
            </div>
        </div>
    );
};

export default KpiChartByClass;