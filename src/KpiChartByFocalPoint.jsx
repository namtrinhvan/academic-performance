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
import styles from './KpiChartByFocalPoint.module.scss';
import RadioDropdown from './RadioDropdown';
import CheckboxDropdown from './CheckboxDropdown';
import { FaCalendarAlt, FaGraduationCap, FaBookOpen } from 'react-icons/fa';

// --- 1. CONSTANTS & DATA MAPPING ---

const TIME_OPTIONS = [
    { label: 'Giữa kỳ I (Q1)', value: 'Q1' },
    { label: 'Cuối kỳ I (Q2)', value: 'Q2' },
    { label: 'Giữa kỳ II (Q3)', value: 'Q3' },
    { label: 'Cuối kỳ II (Q4)', value: 'Q4' },
    { label: 'Học kỳ I (HK1)', value: 'HK1' },
    { label: 'Học kỳ II (HK2)', value: 'HK2' },
    { label: 'Cả năm (Year)', value: 'YEAR' }
];

const GRADE_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
    label: `Khối ${i + 1}`,
    value: i + 1
}));

// Dữ liệu mapping từ danh sách bạn cung cấp (Unique values)
const SUBJECT_FOCAL_POINTS = {
    "VN TOÁN": [
        "Thống kê và xác suất",
        "Hình học và đo lường (hình không gian)",
        "Số, đại số và một số yếu tố giải tích",
        "Hình học và đo lường",
        "Đại số và Giải tích",
        "Hình học"
    ],
    // Placeholder các môn khác để UI không bị trống nếu mở rộng sau này
    "ENGLISH": ["Grammar", "Vocabulary", "Listening", "Reading", "Speaking", "Writing"],
    "NGỮ VĂN": ["Đọc hiểu", "Làm văn", "Thực hành tiếng Việt", "Văn học sử"]
};

// Tạo options cho dropdown môn học dựa trên keys của object trên
const SUBJECT_OPTIONS = Object.keys(SUBJECT_FOCAL_POINTS).map(sub => ({
    label: sub,
    value: sub
}));

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const KpiChartByFocalPoint = ({ kpiType }) => {
    // --- 2. MOUNT CONDITION ---
    // Chỉ hiển thị nếu kpiType là TDS_PR_UP
    if (kpiType !== 'TDS_PR_UP') {
        return null;
    }

    // --- 3. LOCAL STATE ---
    const [selectedTimes, setSelectedTimes] = useState(['Q1']);
    const [selectedGrade, setSelectedGrade] = useState(6);
    const [selectedSubject, setSelectedSubject] = useState('VN TOÁN');

    // --- 4. MOCK DATA GENERATOR ---
    const chartData = useMemo(() => {
        // Lấy danh sách Focal Points của môn đã chọn
        // Nếu không tìm thấy môn (trường hợp data lỗi), trả về mảng rỗng
        const focalPoints = SUBJECT_FOCAL_POINTS[selectedSubject] || [];

        const baseTargets = {
            Q1: 75, Q2: 78, Q3: 80, Q4: 82,
            HK1: 77, HK2: 81, YEAR: 85
        };

        // Map qua từng Focal Point (Trục X)
        return focalPoints.map((point) => {
            const pointData = {
                name: point, // Tên Focal Point hiển thị trục X
            };

            selectedTimes.forEach(time => {
                // 1. Mock điểm thực tế (Bar)
                // Random logic: Các phần Đại số/Số học thường điểm cao hơn Hình học một chút
                const isGeometry = point.toLowerCase().includes('hình');
                const difficultyMod = isGeometry ? -3 : 2;

                let actual = Math.floor(Math.random() * (95 - 60 + 1)) + 60 + difficultyMod;
                if (actual > 100) actual = 100;

                pointData[time] = actual;

                // 2. Mock KPI Target (Line)
                const fluctuation = (Math.random() * 4) - 2;
                let targetVal = (baseTargets[time] || 80) + fluctuation;
                if (targetVal > 100) targetVal = 100;

                pointData[`${time}_Target`] = parseFloat(targetVal.toFixed(1));
            });

            return pointData;
        });
    }, [selectedTimes, selectedSubject, selectedGrade]); // Grade thay đổi sẽ trigger reload data mới (random lại)

    // --- 5. CUSTOM TOOLTIP ---
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={styles.customTooltip}>
                    <p className={styles.tooltipLabel}>{label}</p>
                    <div className={styles.tooltipSubject}>Môn: {selectedSubject}</div>
                    <div className={styles.divider}></div>
                    {payload.map((entry, index) => {
                        const isTarget = entry.dataKey.includes('_Target');
                        const timeLabel = entry.dataKey.replace('_Target', '');
                        return (
                            <div key={index} style={{ color: entry.color, fontSize: '12px', marginBottom: '4px' }}>
                                {isTarget ? `KPI ${timeLabel}` : `Thực tế ${timeLabel}`}: <strong>{entry.value}%</strong>
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
                <h3>3. Báo cáo hoàn thành KPIKPI theo Điểm trọng tâm (Focal Point)</h3>
                <p className={styles.subTitle}>Phân tích chi tiết các mảng kiến thức của từng môn học</p>
            </div>

            {/* --- CONTROLS --- */}
            <div className={styles.chartControls}>
                {/* 1. Chọn Thời gian (Checkbox) */}
                <div className={styles.controlGroup}>
                    <div className={styles.label}><FaCalendarAlt /> Thời gian:</div>
                    <CheckboxDropdown
                        className={styles.dropdown}
                        options={TIME_OPTIONS}
                        value={selectedTimes}
                        onChange={setSelectedTimes}
                        placeholder="Chọn kỳ..."
                        maxDisplayTags={1}
                    />
                </div>

                <div className={styles.separator}></div>

                {/* 2. Chọn Khối (Radio) */}
                <div className={styles.controlGroup}>
                    <div className={styles.label}><FaGraduationCap /> Khối:</div>
                    <RadioDropdown
                        className={styles.dropdownShort}
                        options={GRADE_OPTIONS}
                        value={selectedGrade}
                        onChange={setSelectedGrade}
                        placeholder="Chọn khối"
                    />
                </div>

                <div className={styles.separator}></div>

                {/* 3. Chọn Môn học (Radio) - QUAN TRỌNG ĐỂ LOAD FOCAL POINTS */}
                <div className={styles.controlGroup}>
                    <div className={styles.label}><FaBookOpen /> Môn học:</div>
                    <RadioDropdown
                        className={styles.dropdownWide}
                        options={SUBJECT_OPTIONS}
                        value={selectedSubject}
                        onChange={setSelectedSubject}
                        placeholder="Chọn môn học"
                    />
                </div>
            </div>

            {/* --- CHART AREA --- */}
            <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={500}>
                    <ComposedChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 80 }} // Bottom lớn để chứa label dài
                        barGap={4}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaecf0" />

                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#667085', fontSize: 11 }}
                            interval={0}
                            angle={-30} // Nghiêng chữ vì tên Focal Point thường rất dài
                            textAnchor="end"
                            dy={10}
                        />

                        <YAxis
                            unit="%"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#667085', fontSize: 12 }}
                            domain={[0, 100]}
                        />

                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            layout="horizontal"
                            verticalAlign="top"
                            align="center"
                            wrapperStyle={{ paddingBottom: '20px' }}
                        />

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
                                        maxBarSize={40}
                                        fillOpacity={0.85}
                                    />

                                    {/* Line: KPI Target */}
                                    <Line
                                        type="monotone"
                                        dataKey={`${time}_Target`}
                                        name={`KPI ${time}`}
                                        stroke={color}
                                        strokeWidth={2}
                                        dot={{ r: 4, fill: '#fff', stroke: color, strokeWidth: 2 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </React.Fragment>
                            );
                        })}
                    </ComposedChart>
                </ResponsiveContainer>

                {/* Empty State */}
                {selectedTimes.length === 0 && (
                    <div className={styles.noDataOverlay}>
                        Vui lòng chọn ít nhất một mốc thời gian.
                    </div>
                )}

                {/* No Focal Points State (Trường hợp môn học chưa có data mapping) */}
                {chartData.length === 0 && selectedTimes.length > 0 && (
                    <div className={styles.noDataOverlay}>
                        Chưa có dữ liệu Focal Point cho môn học này.
                    </div>
                )}
            </div>
        </div>
    );
};

export default KpiChartByFocalPoint;