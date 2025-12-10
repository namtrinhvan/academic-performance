import React, {useState, useMemo, useEffect, useRef} from 'react';
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import styles from './KpiChartByFocalPoint.module.scss';
import RadioDropdown from './RadioDropdown';
import CheckboxDropdown from './CheckboxDropdown';
import {FaCalendarAlt, FaGraduationCap, FaBookOpen, FaArrowDown, FaListUl} from 'react-icons/fa';

// --- 1. CONFIG DATA & STRUCTURE ---

const TIME_OPTIONS = [{label: 'Giữa kỳ I (Q1)', value: 'Q1'}, {
    label: 'Cuối kỳ I (Q2)',
    value: 'Q2'
}, {label: 'Giữa kỳ II (Q3)', value: 'Q3'}, {label: 'Cuối kỳ II (Q4)', value: 'Q4'}, {
    label: 'Học kỳ I (HK1)',
    value: 'HK1'
}, {label: 'Học kỳ II (HK2)', value: 'HK2'}, {label: 'Cả năm (Year)', value: 'YEAR'}];

const GRADE_OPTIONS = Array.from({length: 12}, (_, i) => ({
    label: `Khối ${i + 1}`, value: i + 1
}));

// Cấu trúc dữ liệu: Môn -> Danh sách FP -> Danh sách PS của FP đó
const SUBJECT_STRUCTURE = {
    "VN TOÁN": [{
        name: "Thống kê và xác suất",
        ps: ["PS1: Thu thập, phân loại, biểu diễn số liệu", "PS2: Phân tích và xử lý số liệu thống kê", "PS3: Tính xác suất thực nghiệm"]
    }, {
        name: "Hình học (không gian)",
        ps: ["PS1: Nhận biết các hình khối trong thực tiễn", "PS2: Tính diện tích xung quanh và thể tích"]
    }, {
        name: "Đại số và Giải tích",
        ps: ["PS1: Thực hiện phép tính với số thực", "PS2: Giải phương trình và bất phương trình", "PS3: Hàm số và đồ thị"]
    }, {
        name: "Hình học và đo lường", ps: ["PS1: Quan hệ song song và vuông góc", "PS2: Hệ thức lượng trong tam giác"]
    }],
    "NGỮ VĂN": [{
        name: "Kỹ năng Đọc hiểu",
        ps: ["PS1: Nhận biết thể loại văn bản", "PS2: Phân tích nội dung và nghệ thuật", "PS3: Liên hệ thực tiễn"]
    }, {
        name: "Kỹ năng Viết", ps: ["PS1: Viết đoạn văn nghị luận", "PS2: Viết bài văn thuyết minh"]
    }],
    "ENGLISH": [{
        name: "Language Arts",
        ps: ["PS1: Grammar & Vocabulary usage", "PS2: Reading Comprehension"]
    }, {name: "Communication", ps: ["PS1: Speaking fluency", "PS2: Listening comprehension"]}]
};

const SUBJECT_OPTIONS = Object.keys(SUBJECT_STRUCTURE).map(sub => ({
    label: sub, value: sub
}));

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const KpiChartByFocalPoint = ({kpiType}) => {
    // --- 2. STATE ---
    const [selectedTimes, setSelectedTimes] = useState(['Q1']);
    const [selectedGrade, setSelectedGrade] = useState(10);
    const [selectedSubject, setSelectedSubject] = useState('VN TOÁN');

    // State cho Drill-down: Lưu object FP đang được chọn
    const [selectedFocalPoint, setSelectedFocalPoint] = useState(null);

    const psChartRef = useRef(null); // Để scroll xuống khi click

    // Reset selection khi đổi môn hoặc khối
    useEffect(() => {
        setSelectedFocalPoint(null);
    }, [selectedSubject, selectedGrade]);

    // --- 3. DATA GENERATOR (FP LEVEL) ---
    const chartDataFP = useMemo(() => {
        const fps = SUBJECT_STRUCTURE[selectedSubject] || [];
        const baseTargets = {Q1: 75, Q2: 78, Q3: 80, Q4: 82, HK1: 77, HK2: 81, YEAR: 85};

        return fps.map((fp, index) => {
            const row = {name: fp.name, fullName: fp.name, id: index, psList: fp.ps};
            selectedTimes.forEach(time => {
                // Mock Score
                let actual = Math.floor(Math.random() * (95 - 60)) + 60;
                row[time] = actual;

                // Mock Target
                let target = baseTargets[time] + (Math.random() * 5 - 2);
                row[`${time}_Target`] = parseFloat(target.toFixed(1));
            });
            return row;
        });
    }, [selectedSubject, selectedTimes, selectedGrade]);

    // --- 4. DATA GENERATOR (PS LEVEL) ---
    const chartDataPS = useMemo(() => {
        if (!selectedFocalPoint) return [];

        const psList = selectedFocalPoint.psList || [];
        const baseTargets = {Q1: 75, Q2: 78, Q3: 80, Q4: 82, HK1: 77, HK2: 81, YEAR: 85};

        return psList.map((psName) => {
            const row = {name: psName}; // Tên PS (dài)

            selectedTimes.forEach(time => {
                // Logic: Điểm PS sẽ dao động quanh điểm của FP cha
                // Ví dụ: FP được 80 thì các PS con sẽ tầm 75-85
                const parentScore = selectedFocalPoint[time] || 75;
                const variance = Math.floor(Math.random() * 16) - 8; // +/- 8 điểm
                let actual = parentScore + variance;
                if (actual > 100) actual = 100;
                if (actual < 0) actual = 0;

                row[time] = actual;

                // Target của PS thường giống hoặc chỉnh sửa nhẹ so với FP
                const parentTarget = selectedFocalPoint[`${time}_Target`] || 80;
                row[`${time}_Target`] = parentTarget;
            });
            return row;
        });
    }, [selectedFocalPoint, selectedTimes]);

    // --- 5. HANDLERS ---
    const handleBarClick = (data) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            const clickedData = data.activePayload[0].payload;
            setSelectedFocalPoint(clickedData);

            // Smooth scroll xuống biểu đồ PS
            setTimeout(() => {
                if (psChartRef.current) {
                    psChartRef.current.scrollIntoView({behavior: 'smooth', block: 'center'});
                }
            }, 100);
        }
    };

    // --- 6. RENDER HELPERS ---
    const CustomTooltip = ({active, payload, label}) => {
        if (active && payload && payload.length) {
            return (<div className={styles.customTooltip}>
                    <p className={styles.tooltipLabel}>{label}</p>
                    <div className={styles.divider}></div>
                    {payload.map((entry, index) => {
                        const isTarget = entry.dataKey.includes('_Target');
                        const timeLabel = entry.dataKey.replace('_Target', '');
                        return (<div key={index} style={{color: entry.color, fontSize: '12px', marginBottom: '4px'}}>
                                {isTarget ? `KPI ${timeLabel}` : `Thực tế ${timeLabel}`}: <strong>{entry.value}%</strong>
                            </div>);
                    })}
                    {!label.startsWith('PS') &&
                        <div style={{fontSize: '10px', color: '#666', marginTop: '8px', fontStyle: 'italic'}}>(Click cột
                            để xem chi tiết PS)</div>}
                </div>);
        }
        return null;
    };

    if (kpiType !== 'TDS_PR_UP') return null;

    return (<div className={styles.chartWrapper}>
            {/* --- MASTER CHART (FOCAL POINTS) --- */}
            <div className={styles.chartHeader}>
                <h3>3. Báo cáo hoàn thành KPI theo Trọng tâm (Focal Point)</h3>
                <p className={styles.subTitle}>Nhấn vào từng cột Focal Point để xem chi tiết các Tiêu chuẩn năng lực
                    (PS)</p>
            </div>

            <div className={styles.chartControls}>
                <div className={styles.controlGroup}>
                    <div className={styles.label}><FaCalendarAlt/> Thời gian:</div>
                    <CheckboxDropdown
                        className={styles.dropdown}
                        options={TIME_OPTIONS}
                        value={selectedTimes}
                        onChange={setSelectedTimes}
                        placeholder="Chọn kỳ..."
                        maxDisplayTags={1}
                    />
                </div>
                <div className={styles.controlGroup}>
                    <div className={styles.label}><FaGraduationCap/> Khối:</div>
                    <RadioDropdown
                        className={styles.dropdownShort}
                        options={GRADE_OPTIONS}
                        value={selectedGrade}
                        onChange={setSelectedGrade}
                    />
                </div>
                <div className={styles.controlGroup}>
                    <div className={styles.label}><FaBookOpen/> Môn học:</div>
                    <RadioDropdown
                        className={styles.dropdownWide}
                        options={SUBJECT_OPTIONS}
                        value={selectedSubject}
                        onChange={setSelectedSubject}
                    />
                </div>
            </div>

            <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={450}>
                    <ComposedChart
                        data={chartDataFP}
                        margin={{top: 20, right: 30, left: 0, bottom: 60}}
                        barGap={4}
                        onClick={handleBarClick} // CLICK HANDLER
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaecf0"/>
                        <XAxis
                            dataKey="name"
                            axisLine={false} tickLine={false} tick={{fill: '#667085', fontSize: 11}}
                            interval={0} angle={-15} textAnchor="end" dy={10}
                        />
                        <YAxis unit="%" axisLine={false} tickLine={false} tick={{fill: '#667085', fontSize: 12}}
                               domain={[0, 100]}/>
                        <Tooltip content={<CustomTooltip/>} cursor={{fill: 'rgba(0, 136, 254, 0.1)'}}/>
                        <Legend layout="horizontal" verticalAlign="top" align="center"
                                wrapperStyle={{paddingBottom: '20px'}}/>

                        {selectedTimes.map((time, index) => (<React.Fragment key={time}>
                                <Bar
                                    dataKey={time}
                                    fill={COLORS[index % COLORS.length]}
                                    name={`Thực tế ${time}`}
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={50}
                                    cursor="pointer"
                                >
                                    {/* Highlight cột đang chọn */}
                                    {chartDataFP.map((entry, idx) => (<Cell
                                            key={`cell-${idx}`}
                                            fill={selectedFocalPoint && selectedFocalPoint.name === entry.name ? '#FF8042' : COLORS[index % COLORS.length]}
                                            fillOpacity={selectedFocalPoint && selectedFocalPoint.name === entry.name ? 1 : 0.8}
                                        />))}
                                </Bar>
                                <Line
                                    type="monotone"
                                    dataKey={`${time}_Target`}
                                    name={`KPI ${time}`}
                                    stroke={COLORS[index % COLORS.length]}
                                    strokeWidth={2}
                                    dot={{r: 4}}
                                />
                            </React.Fragment>))}
                    </ComposedChart>
                </ResponsiveContainer>
                {chartDataFP.length === 0 && <div className={styles.noDataOverlay}>Không có dữ liệu.</div>}
            </div>

            {/* --- DETAIL CHART (PERFORMANCE STANDARDS) --- */}
            {selectedFocalPoint && (<div className={styles.detailSection} ref={psChartRef}
                                         style={{
                                             marginTop: '40px',
                                             borderTop: '1px dashed #eaecf0',
                                             paddingTop: '30px'
                                         }}>
                    <div className={styles.chartHeader}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <div style={{background: '#eff8ff', padding: '8px', borderRadius: '50%', color: '#0088FE'}}>
                                <FaListUl/>
                            </div>
                            <div>
                                <h3 style={{color: '#0088FE'}}>Chi tiết Tiêu chuẩn (PS)
                                    thuộc: {selectedFocalPoint.name}</h3>
                                <p className={styles.subTitle}>Phân tích các tiêu chuẩn năng lực cấu thành nên trọng tâm
                                    này</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={400}>
                            <ComposedChart
                                data={chartDataPS}
                                layout="vertical" // Đổi sang biểu đồ ngang để hiển thị tên PS dài tốt hơn
                                margin={{top: 20, right: 30, left: 20, bottom: 20}}
                                barGap={2}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eaecf0"/>
                                <XAxis type="number" unit="%" domain={[0, 100]} hide/>
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={250} // Dành nhiều chỗ cho tên PS
                                    tick={{fill: '#344054', fontSize: 11, fontWeight: 500}}
                                />
                                <Tooltip content={<CustomTooltip/>} cursor={{fill: 'transparent'}}/>
                                <Legend verticalAlign="top" align="right"/>

                                {selectedTimes.map((time, index) => (<React.Fragment key={time}>
                                        <Bar
                                            dataKey={time}
                                            fill={COLORS[index % COLORS.length]}
                                            name={`Điểm PS ${time}`}
                                            radius={[0, 4, 4, 0]}
                                            barSize={20}
                                        />
                                        {/* Vẽ target dạng vạch đứng trên bar ngang */}
                                        <Bar
                                            dataKey={`${time}_Target`}
                                            name={`KPI ${time}`}
                                            fill="none"
                                            stroke="#FF8042"
                                            strokeWidth={2}
                                            barSize={20}
                                            // Trick để vẽ vạch target trên bar ngang: dùng errorBar hoặc custom shape (ở đây demo simplified bằng Bar rỗng)
                                        />
                                        {/* Lưu ý: Recharts hỗ trợ Line trên Vertical Chart hạn chế, nên ta tập trung vào Bar so sánh */}
                                    </React.Fragment>))}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>)}
        </div>);
};

export default KpiChartByFocalPoint;