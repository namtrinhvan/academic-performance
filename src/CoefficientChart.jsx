import React, { useState, useMemo, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Label,
    Legend
} from 'recharts';
import styles from './CoefficientChart.module.scss';
import RadioDropdown from './RadioDropdown';
import {
    FaCalendarAlt,
    FaLayerGroup,
    FaBook,
    FaGraduationCap,
    FaExchangeAlt,
    FaInfoCircle
} from 'react-icons/fa';

// --- CONSTANTS ---
const PROGRAMS = [
    { label: 'Discover', value: 'Discover' },
    { label: 'Adventure', value: 'Adventure' },
    { label: 'Journey', value: 'Journey' }
];

const VIEW_MODES = [
    { label: 'Theo Khối lớp', value: 'GRADE' },
    { label: 'Theo Môn học', value: 'SUBJECT' }
];

const TIME_TYPES = [
    { label: 'Nửa học kỳ (Quarter)', value: 'QUARTER' },
    { label: 'Học kỳ (Semester)', value: 'SEMESTER' },
    { label: 'Cả năm (Year)', value: 'YEAR' },
];

const GRADE_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
    label: `Khối ${i + 1}`, // 6 -> 12
    value: i + 6
}));

// Chỉ những môn có mapping (có cả 2 đầu điểm) mới tính được tương quan
const MAPPED_SUBJECTS = [
    { label: "TOÁN - VN TOÁN", value: "TOAN" },
    { label: "NGỮ VĂN - VN VĂN", value: "VAN" },
    { label: "TIẾNG ANH - ENGLISH", value: "ENGLISH" },
    { label: "KHTN - VN KHTN", value: "KHTN" },
    { label: "LỊCH SỬ - VN SỬ", value: "SU" },
    { label: "ĐỊA LÝ - VN ĐỊA", value: "DIA" },
    { label: "VẬT LÝ - VN LÝ", value: "LY" },
    { label: "HÓA HỌC - VN HÓA", value: "HOA" },
    { label: "SINH HỌC - VN SINH", value: "SINH" }
];

const CoefficientChart = ({
                              timeType,
                              setTimeType,
                              setSelectedProgram,
                              setSelectedTime,
                              selectedTime,
                              selectedProgram
                          }) => {
    // --- 1. LOCAL STATE ---
    const [viewMode, setViewMode] = useState('GRADE'); // Trục X là gì?

    // Conditional Filters State
    const [selectedSubject, setSelectedSubject] = useState(MAPPED_SUBJECTS[0].value); // Dùng khi viewMode = GRADE
    const [selectedGrade, setSelectedGrade] = useState(6); // Dùng khi viewMode = SUBJECT

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

        if (viewMode === 'GRADE') {
            // TRỤC X: KHỐI (6 -> 12)
            // Ý nghĩa: Xem độ tương quan của Môn X thay đổi thế nào qua các cấp lớp
            GRADE_OPTIONS.forEach(g => {
                // Mock Correlation: Random từ 0.4 đến 0.95
                // Giả lập: Lớp càng lớn độ tương quan càng chặt chẽ (học sinh ổn định năng lực)
                const base = 0.5 + (g.value * 0.02);
                let coef = base + (Math.random() * 0.3);
                if (coef > 0.98) coef = 0.98;

                data.push({
                    name: g.label,
                    value: parseFloat(coef.toFixed(2)),
                    context: `Môn ${MAPPED_SUBJECTS.find(s=>s.value === selectedSubject)?.label}`
                });
            });
        } else {
            // TRỤC X: MÔN HỌC
            // Ý nghĩa: Xem trong Khối X, môn nào có điểm thi và điểm quá trình đồng bộ nhất
            MAPPED_SUBJECTS.forEach(s => {
                // Mock Correlation
                // Giả lập: Môn tự nhiên thường tương quan cao hơn môn xã hội
                const isScience = ['TOAN', 'LY', 'HOA', 'KHTN'].includes(s.value);
                const base = isScience ? 0.7 : 0.5;
                let coef = base + (Math.random() * 0.25);

                data.push({
                    name: s.label.split('(')[0].trim(), // Lấy tên ngắn gọn
                    fullName: s.label,
                    value: parseFloat(coef.toFixed(2)),
                    context: `Khối ${selectedGrade}`
                });
            });
        }
        return data;
    }, [viewMode, selectedSubject, selectedGrade, selectedTime, selectedProgram]);

    // --- 4. TOOLTIP ---
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const val = payload[0].value;
            let evalText = "Yếu";
            let color = "#ef4444"; // Red
            if (val >= 0.5) { evalText = "Trung bình"; color = "#f59e0b"; } // Orange
            if (val >= 0.7) { evalText = "Mạnh"; color = "#10b981"; } // Green
            if (val >= 0.9) { evalText = "Rất mạnh"; color = "#059669"; } // Dark Green

            return (
                <div className={styles.customTooltip}>
                    <div className={styles.tooltipHeader}>{label}</div>
                    <div className={styles.tooltipSub}>{payload[0].payload.context}</div>
                    <div className={styles.divider}></div>
                    <div className={styles.metricRow}>
                        <span>Hệ số r:</span>
                        <strong style={{ fontSize: '1.1rem' }}>{val}</strong>
                    </div>
                    <div className={styles.evalRow} style={{ color }}>
                        Đánh giá: <strong>{evalText}</strong>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={styles.chartWrapper}>
            {/* --- CONTROLS SECTION --- */}
            <div className={styles.chartControls}>
                <div className={styles.controlGroup}>
                    <span className={styles.label}>Trục hiển thị:</span>
                    <RadioDropdown
                        className={styles.dropdown}
                        options={VIEW_MODES}
                        value={viewMode}
                        onChange={setViewMode}
                    />
                </div>

                {/* 2. Conditional Filter (Subject OR Grade) */}
                {viewMode === 'GRADE' ? (
                    <div className={styles.controlGroup}>
                        <span className={styles.label}>Môn học:</span>
                        <RadioDropdown
                            className={styles.dropdownWide}
                            options={MAPPED_SUBJECTS}
                            value={selectedSubject}
                            onChange={setSelectedSubject}
                        />
                    </div>
                ) : (
                    <div className={styles.controlGroup}>
                        <span className={styles.label}>Chọn khối phân tích:</span>
                        <RadioDropdown
                            className={styles.dropdown}
                            options={GRADE_OPTIONS}
                            value={selectedGrade}
                            onChange={setSelectedGrade}
                        />
                    </div>
                )}


            </div>

            {/* --- CHART SECTION --- */}
            <div className={styles.chartContainer}>
                <div className={styles.headerArea}>
                    <h4 className={styles.chartTitle}>
                        Biểu đồ Hệ số tương quan (Correlation Coefficient) - {selectedTime}
                    </h4>
                    <div className={styles.chartLegend}>
                        <div className={styles.legendItem}>
                            <span className={styles.dot} style={{background: '#10b981'}}></span>
                            Mạnh (&gt;0.7)
                        </div>
                        <div className={styles.legendItem}>
                            <span className={styles.dot} style={{background: '#f59e0b'}}></span>
                            Trung bình (0.5 - 0.7)
                        </div>
                        <div className={styles.legendItem}>
                            <span className={styles.dot} style={{background: '#ef4444'}}></span>
                            Yếu (&lt;0.5)
                        </div>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={500}>
                    <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 10, bottom: 80 }}
                    >
                        <CartesianGrid  vertical={false} stroke="#f2f4f7" />

                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#667085', fontSize: 12 }}
                            dy={10}
                            interval={0} // Hiển thị hết nhãn
                            angle={viewMode === 'SUBJECT' ? -45 : -45} // Nghiêng nếu tên môn dài
                            textAnchor={viewMode === 'SUBJECT' ? 'end' : 'middle'}
                        />

                        <YAxis
                            domain={[0, 1]}
                            tickCount={6}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#667085', fontSize: 12 }}
                            label={{ value: 'Hệ số tương quan', angle: -90, position: 'insideLeft', fill: '#98a2b3', fontSize: 12 }}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        {/* Reference Lines (Các ngưỡng đánh giá) */}
                        <ReferenceLine y={0.7} stroke="#10b981" strokeDasharray="3 3">
                            <Label value="Mạnh (0.7)" position="insideTopRight" fill="#10b981" fontSize={11} />
                        </ReferenceLine>
                        <ReferenceLine y={0.5} stroke="#f59e0b" strokeDasharray="3 3">
                            <Label value="Trung bình (0.5)" position="insideTopRight" fill="#f59e0b" fontSize={11} />
                        </ReferenceLine>

                        {/* Main Line */}
                        <Line
                            type="linear"
                            dataKey="value"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: '#3b82f6' }}
                            animationDuration={1000}
                        />
                    </LineChart>
                </ResponsiveContainer>

            </div>
        </div>
    );
};

export default CoefficientChart;