import React, { useState, useMemo, useEffect } from 'react';
import {
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import styles from './StackedBarChart.module.scss';
import RadioDropdown from './RadioDropdown';
import CheckboxDropdown from './CheckboxDropdown';
import {
    FaCalendarAlt,
    FaLayerGroup,
    FaBook,
    FaChartPie,
    FaListOl,
    FaChartArea,
    FaChartBar
} from 'react-icons/fa';

// --- CONSTANTS ---

// 1. Cấu hình các mức điểm
const GRADE_LEVELS = [
    { key: 'APlus', label: 'AD', color: '#10b981' },
    { key: 'A',     label: 'PR/AD', color: '#34d399' },
    { key: 'BPlus', label: 'PR',    color: '#6ee7b7' },
    { key: 'B',     label: 'EM/PR', color: '#a7f3d0' },
    { key: 'CPlus', label: 'EM',    color: '#fde047' },
    { key: 'C',     label: 'NV/EM', color: '#fcd34d' },
    { key: 'D',     label: 'NV',    color: '#fb923c' },
    { key: 'F',     label: 'IE',    color: '#ef4444' }
];


const PROGRAMS = [
    { label: 'Discover', value: 'Discover' },
    { label: 'Adventure', value: 'Adventure' },
    { label: 'Journey', value: 'Journey' }
];

const TIME_TYPES = [
    { label: 'Nửa học kỳ (Quarter)', value: 'QUARTER' },
    { label: 'Học kỳ (Semester)', value: 'SEMESTER' },
    { label: 'Cả năm (Year)', value: 'YEAR' },
];

const TDS_SUBJECTS = [
    { label: "TIẾNG VIỆT", value: "VN_VIET" },
    { label: "TOÁN (VN Math)", value: "VN_MATH" },
    { label: "ENGLISH", value: "ENGLISH" },
    { label: "KHTN (Natural Sci)", value: "VN_SCI" },
    { label: "LỊCH SỬ", value: "VN_HIS" },
    { label: "ĐỊA LÝ", value: "VN_GEO" },
    { label: "NGHỆ THUẬT (Art)", value: "ART" }
];

const VIEW_MODES = [
    { label: 'Số lượng', value: 'COUNT', icon: <FaListOl /> },
    { label: 'Phần trăm', value: 'PERCENT', icon: <FaChartPie /> }
];

const CHART_TYPES = [
    { label: 'Biểu đồ Cột ', value: 'BAR' },
    { label: 'Biểu đồ Vùng ', value: 'AREA' }
];

const StackedBarChart = ({
                             timeType,
                             setTimeType,
                             setSelectedProgram,
                             setSelectedTime,
                             selectedTime,
                             selectedProgram
                         }) => {
    // --- 1. LOCAL STATE ---
    const [chartMode, setChartMode] = useState('COUNT'); // COUNT | PERCENT
    const [chartType, setChartType] = useState('AREA'); // BAR | AREA

    // Time State


    const [selectedSubjects, setSelectedSubjects] = useState(['VN_MATH', 'ENGLISH']);

    // --- 2. DYNAMIC OPTIONS ---
    const timeOptions = useMemo(() => {
        switch (timeType) {
            case 'QUARTER': return [
                { label: 'Giữa kỳ I (Q1)', value: 'Q1' }, { label: 'Cuối kỳ I (Q2)', value: 'Q2' },
                { label: 'Giữa kỳ II (Q3)', value: 'Q3' }, { label: 'Cuối kỳ II (Q4)', value: 'Q4' }
            ];
            case 'SEMESTER': return [{ label: 'Học kỳ I', value: 'HK1' }, { label: 'Học kỳ II', value: 'HK2' }];
            case 'YEAR': return [{ label: 'Cả năm', value: 'YEAR' }];
            default: return [];
        }
    }, [timeType]);

    useEffect(() => {
        if (timeOptions.length > 0) setSelectedTime(timeOptions[0].value);
    }, [timeType, timeOptions]);

    // --- 3. MOCK DATA GENERATOR ---
    const chartData = useMemo(() => {
        const data = [];
        for (let i = 1; i <= 12; i++) {
            const gradeItem = {
                name: `Khối ${i}`,
                fullName: `Khối ${i}`
            };

            let total = 0;
            GRADE_LEVELS.forEach(level => {
                let base = 20;
                // Logic giả lập biến thiên theo khối
                if (['APlus', 'A'].includes(level.key) && i <= 5) base += 10;
                if (['F', 'D'].includes(level.key) && i > 9) base += 5;

                const count = Math.floor(Math.random() * base) + 1;
                gradeItem[level.key] = count;
                total += count;
            });
            gradeItem.total = total;
            data.push(gradeItem);
        }
        return data;
    }, [selectedProgram, selectedSubjects, selectedTime]);

    // --- 4. RENDER HELPERS ---

    const toPercent = (decimal, fixed = 0) => `${(decimal * 100).toFixed(2)}%`;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;

            // Sắp xếp payload theo thứ tự GRADE_LEVELS (Từ A+ xuống F) để hiển thị trong tooltip
            const sortedPayload = [...payload].sort((a, b) => {
                const indexA = GRADE_LEVELS.findIndex(l => l.key === a.dataKey);
                const indexB = GRADE_LEVELS.findIndex(l => l.key === b.dataKey);
                return indexA - indexB;
            });

            return (
                <div className={styles.customTooltip}>
                    <div className={styles.tooltipHeader}>
                        {data.fullName}
                        <span className={styles.totalBadge}>{data.total} học sinh</span>
                    </div>
                    <div className={styles.tooltipTable}>
                        {sortedPayload.map((entry) => {
                            const levelConfig = GRADE_LEVELS.find(l => l.key === entry.dataKey);

                            // Tính % thủ công để hiển thị chính xác bất kể chế độ chart
                            // Với Stacked Percent của Recharts, entry.value đôi khi trả về khoảng [0,1], đôi khi trả về raw value tùy loại chart
                            // Nên an toàn nhất là lấy raw value từ data gốc (data[entry.dataKey]) chia cho total
                            const rawValue = data[entry.dataKey];
                            const percent = ((rawValue / data.total) * 100).toFixed(1);

                            return (
                                <div key={entry.dataKey} className={styles.tooltipRow}>
                                    <div className={styles.rowLabel}>
                                        <span
                                            className={styles.dot}
                                            style={{backgroundColor: levelConfig?.color}}
                                        ></span>
                                        {levelConfig?.label}
                                    </div>
                                    <div className={styles.rowValue}>
                                        <strong>{rawValue}</strong>
                                        <span className={styles.subPercent}>({percent}%)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }
        return null;
    };

    // Chuẩn bị các Props chung cho cả BarChart và AreaChart
    const commonChartProps = {
        data: chartData,
        margin: {top: 20, right: 30, left: 10, bottom: 40},
        stackOffset: chartMode === 'PERCENT' ? 'expand' : 'none'
    };

    return (
        <div className={styles.chartWrapper}>
            {/* --- CONTROLS SECTION --- */}
            <div className={styles.chartControls}>
                {/* 1. Chart Type & Time (Grouped) */}
                <div className={styles.controlGroup}>
                    <span className={styles.label}>
                      Loại biểu đồ:
                    </span>
                    <RadioDropdown
                        className={styles.dropdownShort}
                        options={CHART_TYPES}
                        value={chartType}
                        onChange={setChartType}
                    />
                </div>

                <div className={styles.separator}></div>
                <div className={styles.controlGroup}>
                    <span className={styles.label}>Môn học:</span>
                    <CheckboxDropdown
                        className={styles.dropdownWide}
                        options={TDS_SUBJECTS}
                        value={selectedSubjects}
                        onChange={setSelectedSubjects}
                        placeholder="Chọn môn"
                        maxDisplayTags={1}
                    />
                </div>

                {/* 3. Toggle Mode */}
                <div className={styles.modeToggleGroup}>
                    {VIEW_MODES.map(mode => (
                        <button
                            key={mode.value}
                            className={`${styles.toggleBtn} ${chartMode === mode.value ? styles.active : ''}`}
                            onClick={() => setChartMode(mode.value)}
                            title={mode.label}
                        >
                            <span className={styles.btnText}>{mode.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* --- CHART SECTION --- */}
            <div className={styles.chartContainer}>
                <div className={styles.headerArea}>
                    <h4 className={styles.chartTitle}>
                        Phân bố Điểm TDS theo Khối - {selectedTime}
                    </h4>
                    <p className={styles.subTitle}>
                        {chartType === 'BAR' ? 'Biểu đồ cột chồng' : 'Biểu đồ vùng chồng'} thể hiện {chartMode === 'COUNT' ? 'số lượng' : 'tỷ lệ %'} học sinh đạt các mức điểm
                    </p>
                </div>

                <ResponsiveContainer width="100%" height={500}>
                    {chartType === 'BAR' ? (
                        /* --- STACKED BAR CHART --- */
                        <BarChart  {...commonChartProps}>
                            <CartesianGrid vertical={false} stroke="#eaecf0" />
                            <XAxis
                                angle={-45}

                                dataKey="name"
                                axisLine={false} tickLine={false}
                                tick={{ fill: '#667085', fontSize: 12, fontWeight: 500 }} dy={10}
                            />
                            <YAxis
                                axisLine={false} tickLine={false}
                                tick={{ fill: '#667085', fontSize: 12 }}
                                tickFormatter={chartMode === 'PERCENT' ? toPercent : (val) => val}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                            <Legend
                                iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }}
                                payload={GRADE_LEVELS.map(item => ({ id: item.key, type: 'circle', value: item.label, color: item.color }))}
                            />
                            {/* Render từ dưới lên (F trước) */}
                            {[...GRADE_LEVELS].reverse().map((level) => (
                                <Bar key={level.key} dataKey={level.key} name={level.label} stackId="a" fill={level.color} barSize={50} />
                            ))}
                        </BarChart>
                    ) : (
                        /* --- STACKED AREA CHART --- */
                        <AreaChart {...commonChartProps}>
                            <CartesianGrid vertical={false} stroke="#eaecf0" />
                            <XAxis

                                angle={-45}

                                dataKey="name"
                                axisLine={false} tickLine={false}
                                tick={{ fill: '#667085', fontSize: 12, fontWeight: 500 }} dy={10}
                            />
                            <YAxis
                                axisLine={false} tickLine={false}
                                tick={{ fill: '#667085', fontSize: 12 }}
                                tickFormatter={chartMode === 'PERCENT' ? toPercent : (val) => val}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }}
                                payload={GRADE_LEVELS.map(item => ({ id: item.key, type: 'circle', value: item.label, color: item.color }))}
                            />
                            {/* Render từ dưới lên (F trước) */}
                            {[...GRADE_LEVELS].reverse().map((level) => (
                                <Area
                                    key={level.key}
                                    type="monotone" // Đường cong mềm mại
                                    dataKey={level.key}
                                    name={level.label}
                                    stackId="1"
                                    stroke={level.color}
                                    fill={level.color}
                                    fillOpacity={1} // Tô màu đặc theo yêu cầu
                                />
                            ))}
                        </AreaChart>
                    )}
                </ResponsiveContainer>

                {chartData.length === 0 && (
                    <div className={styles.noDataOverlay}>Không có dữ liệu phù hợp.</div>
                )}
            </div>
        </div>
    );
};

export default StackedBarChart;