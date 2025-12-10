import React, {useState, useMemo, useEffect} from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label, Cell
} from 'recharts';
import styles from './MoetDistributionChart.module.scss';
import RadioDropdown from './RadioDropdown';
import CheckboxDropdown from './CheckboxDropdown';
import {
    FaCalendarAlt, FaLayerGroup, FaBook, FaGraduationCap, FaArrowsAltH, FaChartBar, FaPercentage
} from 'react-icons/fa';

// --- CONSTANTS ---
const PROGRAMS = [{label: 'Discover', value: 'Discover'}, {label: 'Adventure', value: 'Adventure'}, {
    label: 'Journey',
    value: 'Journey'
}];

const GRADE_OPTIONS = Array.from({length: 12}, (_, i) => ({
    label: `Khối ${i + 1}`, value: i + 1
}));

const MOET_SUBJECTS = [{label: "TOÁN", value: "TOAN"}, {label: "NGỮ VĂN", value: "VAN"}, {
    label: "TIẾNG ANH",
    value: "ENGLISH"
}, {label: "KHTN", value: "KHTN"}, {label: "LỊCH SỬ & ĐỊA LÝ", value: "SU_DIA"}, {
    label: "GDCD",
    value: "GDCD"
}, {label: "CÔNG NGHỆ", value: "CONG_NGHE"}];

const TIME_TYPES = [{label: 'Nửa học kỳ (Quarter)', value: 'QUARTER'}, {
    label: 'Học kỳ (Semester)',
    value: 'SEMESTER'
}, {label: 'Cả năm (Year)', value: 'YEAR'},];

const INTERVAL_OPTIONS = [{label: '0.25 điểm', value: 0.25}, {label: '0.5 điểm', value: 0.5}, {
    label: '1.0 điểm',
    value: 1.0
}, {label: '2.0 điểm', value: 2.0},];

const VIEW_MODES = [{label: 'Số lượng', value: 'COUNT', icon: <FaChartBar/>}, {
    label: 'Phần trăm',
    value: 'PERCENT',
    icon: <FaPercentage/>
},];

const MoetDistributionChart = ({
                                   timeType,
                                   setTimeType,
                                   setSelectedProgram,
                                   setSelectedTime,
                                   selectedTime,
                                   selectedProgram
                               }) => {
    // --- 1. LOCAL STATE ---
    const [viewMode, setViewMode] = useState('COUNT');

    const [selectedGrades, setSelectedGrades] = useState([6, 7, 8, 9]);
    const [selectedSubjects, setSelectedSubjects] = useState(['TOAN']); // Mặc định chọn Toán

    // Configuration
    const [interval, setInterval] = useState(0.5); // Khoảng chia mặc định

    // --- 2. DYNAMIC OPTIONS ---
    const timeOptions = useMemo(() => {
        switch (timeType) {
            case 'QUARTER':
                return [{label: 'Giữa kỳ I (Q1)', value: 'Q1'}, {
                    label: 'Cuối kỳ I (Q2)',
                    value: 'Q2'
                }, {label: 'Giữa kỳ II (Q3)', value: 'Q3'}, {label: 'Cuối kỳ II (Q4)', value: 'Q4'}];
            case 'SEMESTER':
                return [{label: 'Học kỳ I', value: 'HK1'}, {label: 'Học kỳ II', value: 'HK2'}];
            case 'YEAR':
                return [{label: 'Cả năm', value: 'YEAR'}];
            default:
                return [];
        }
    }, [timeType]);

    useEffect(() => {
        if (timeOptions.length > 0) setSelectedTime(timeOptions[0].value);
    }, [timeType, timeOptions]);

    // --- 3. DATA PROCESSING LOGIC ---

    // 3.1 Generate Mock Raw Scores (Giả lập điểm thô của từng học sinh)
    const rawScores = useMemo(() => {
        const scores = [];
        // Giả lập khoảng 500 học sinh
        const studentCount = 500;

        for (let i = 0; i < studentCount; i++) {
            // Tạo phân phối chuẩn (Bell Curve) lệch phải (đa số học sinh điểm khá giỏi)
            // Mean ~ 7.5, StdDev ~ 1.5
            let u = 0, v = 0;
            while (u === 0) u = Math.random();
            while (v === 0) v = Math.random();
            let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            num = num * 1.5 + 7.5; // Scale to mean 7.5

            if (num > 10) num = 10;
            if (num < 0) num = 0;

            // Làm tròn đến 1 chữ số thập phân (như điểm thật)
            scores.push(parseFloat(num.toFixed(1)));
        }
        return scores;
    }, [selectedProgram, selectedGrades, selectedSubjects, selectedTime]);

    // 3.2 Binning Logic (Gom nhóm điểm dựa trên Interval)
    const chartData = useMemo(() => {
        // Tạo các bins: 0, 0+interval, ... 10
        const bins = [];
        const numBins = Math.ceil(10 / interval);

        for (let i = 0; i < numBins; i++) {
            const start = i * interval;
            const end = (i + 1) * interval;
            // Xử lý nhãn hiển thị: Nếu interval = 1 -> "7 - 8", Nếu interval = 0.5 -> "7.0 - 7.5"
            const label = `${parseFloat(start.toFixed(2))} - ${parseFloat(end > 10 ? 10 : end.toFixed(2))}`;

            bins.push({
                rangeStart: start, rangeEnd: end, name: label, count: 0, percent: 0
            });
        }

        // Phân loại điểm vào bins
        rawScores.forEach(score => {
            // Tìm bin phù hợp. Lưu ý: Bin cuối cùng lấy cả 10.
            const binIndex = Math.min(Math.floor(score / interval), numBins - 1);
            if (bins[binIndex]) {
                bins[binIndex].count += 1;
            }
        });

        // Tính phần trăm
        const total = rawScores.length;
        return bins.map(bin => ({
            ...bin, percent: parseFloat(((bin.count / total) * 100).toFixed(1)), totalStudents: total // Truyền tổng xuống để tooltip dùng
        }));

    }, [rawScores, interval]);

    // --- 4. RENDER HELPERS ---
    const CustomTooltip = ({active, payload, label}) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (<div className={styles.customTooltip}>
                    <div className={styles.tooltipHeader}>Khoảng điểm: {data.name}</div>
                    <div className={styles.tooltipRow}>
                        <span>Số lượng:</span>
                        <strong>{data.count} / {data.totalStudents} HS</strong>
                    </div>
                    <div className={styles.tooltipRow}>
                        <span>Tỷ lệ:</span>
                        <strong>{data.percent}%</strong>
                    </div>
                    {/* Phân tích nhanh */}
                    <div className={styles.evalRow}>
                        {data.rangeStart >= 8 ?
                            <span style={{color: '#10b981'}}>Mức Giỏi</span> : data.rangeStart >= 6.5 ?
                                <span style={{color: '#3b82f6'}}>Mức Khá</span> : data.rangeStart >= 5 ?
                                    <span style={{color: '#f59e0b'}}>Mức TB</span> :
                                    <span style={{color: '#ef4444'}}>Mức Yếu</span>}
                    </div>
                </div>);
        }
        return null;
    };

    return (<div className={styles.chartWrapper}>
            {/* --- CONTROLS SECTION --- */}
            <div className={styles.chartControls}>

                <div className={styles.controlGroup}>
                    <span className={styles.label}>Khối:</span>
                    <CheckboxDropdown
                        className={styles.dropdown}
                        options={GRADE_OPTIONS}
                        value={selectedGrades}
                        onChange={setSelectedGrades}
                        placeholder="Chọn Khối"
                        maxDisplayTags={1}
                    />
                </div>

                <div className={styles.controlGroup}>
                    <span className={styles.label}> Môn học:</span>
                    <CheckboxDropdown
                        className={styles.dropdownWide}
                        options={MOET_SUBJECTS}
                        value={selectedSubjects}
                        onChange={setSelectedSubjects}
                        placeholder="Chọn Môn"
                        maxDisplayTags={1}
                    />
                </div>

                <div className={styles.separator}></div>

                {/*/!* 3. Configuration (Interval & ViewMode) *!/*/}
                {/*<div className={styles.controlGroup}>*/}
                {/*    <span className={styles.label}> Khoảng chia:</span>*/}
                {/*    <RadioDropdown*/}
                {/*        className={styles.dropdownShort}*/}
                {/*        options={INTERVAL_OPTIONS}*/}
                {/*        value={interval}*/}
                {/*        onChange={setInterval}*/}
                {/*    />*/}
                {/*</div>*/}

                <div className={styles.modeToggleGroup}>
                    {VIEW_MODES.map(mode => (<button
                            key={mode.value}
                            className={`${styles.toggleBtn} ${viewMode === mode.value ? styles.active : ''}`}
                            onClick={() => setViewMode(mode.value)}
                            title={mode.label}
                        >
                            <span className={styles.btnText}>{mode.label}</span>
                        </button>))}
                </div>
            </div>

            {/* --- CHART SECTION --- */}
            <div className={styles.chartContainer}>
                <div className={styles.headerArea}>
                    <h4 className={styles.chartTitle}>Phân bố Điểm số MOET </h4>
                    <p className={styles.subTitle}>
                        Thống kê {viewMode === 'COUNT' ? 'số lượng' : 'tỷ lệ %'} học sinh theo các khoảng điểm (Độ
                        chia: {interval})
                    </p>
                </div>

                <ResponsiveContainer width="100%" height={500}>
                    <BarChart
                        data={chartData}
                        margin={{top: 20, right: 30, left: 10, bottom: 40}} // Bottom lớn để chứa label nghiêng
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaecf0"/>

                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{fill: '#667085', fontSize: 11}}
                            interval={interval <= 0.25 ? 1 : 0} // Nếu chia quá nhỏ thì cách bớt nhãn
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{fill: '#667085', fontSize: 12}}
                            unit={viewMode === 'PERCENT' ? '%' : ''}
                        />

                        <Tooltip content={<CustomTooltip/>} cursor={{fill: '#f9fafb'}}/>

                        {/* Reference Lines - Các mốc quan trọng */}
                        <ReferenceLine x="5 - 5.5" stroke="#f59e0b" strokeDasharray="3 3">
                            {/* Lưu ý: Recharts RefLine theo category axis cần match chính xác value name.
                                Đây là demo logic, thực tế cần tính index hoặc dùng numeric axis.
                                Ở đây ta dùng numeric value mapping nếu XAxis là number, nhưng XAxis là category name.
                                Nên ta sẽ dùng Segment Reference hoặc đơn giản là vẽ tượng trưng.
                            */}
                        </ReferenceLine>

                        {/* Vùng điểm Yếu (<5) */}
                        <ReferenceLine y={0} stroke="#000"/>

                        <Bar
                            dataKey={viewMode === 'COUNT' ? 'count' : 'percent'}
                            name="Học sinh"
                            // radius={[4, 4, 0, 0]}
                            maxBarSize={60}
                        >
                            {chartData.map((entry, index) => {
                                // Tô màu cột dựa trên khoảng điểm
                                let color = '#3b82f6'; // Mặc định xanh dương
                                if (entry.rangeStart < 5) color = '#ef4444'; // Yếu - Đỏ
                                else if (entry.rangeStart >= 8) color = '#10b981'; // Giỏi - Xanh lá
                                else if (entry.rangeStart >= 6.5) color = '#3b82f6'; // Khá - Xanh dương
                                else color = '#f59e0b'; // TB - Vàng

                                return <Cell key={`cell-${index}`} fill={color}/>;
                            })}
                        </Bar>

                    </BarChart>
                </ResponsiveContainer>

                {/* Chú thích màu sắc */}
                <div className={styles.chartLegend}>
                    <div className={styles.legendItem}><span className={styles.dot}
                                                             style={{background: '#ef4444'}}></span>Yếu (&lt;5)
                    </div>
                    <div className={styles.legendItem}><span className={styles.dot}
                                                             style={{background: '#f59e0b'}}></span>Trung bình (5-6.5)
                    </div>
                    <div className={styles.legendItem}><span className={styles.dot}
                                                             style={{background: '#3b82f6'}}></span>Khá (6.5-8)
                    </div>
                    <div className={styles.legendItem}><span className={styles.dot}
                                                             style={{background: '#10b981'}}></span>Giỏi (&gt;8)
                    </div>
                </div>
            </div>
        </div>);
};

export default MoetDistributionChart;