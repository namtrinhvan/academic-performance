import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
    ReferenceLine
} from 'recharts';
import {FaChartBar, FaLayerGroup, FaBullseye, FaArrowUp} from 'react-icons/fa';
import styles from './Todo1.module.scss';

/**
 * Todo1: Biểu đồ Focal Point (FP) theo từng lớp thuộc khối đã chọn.
 *
 * Props:
 * - grade: Khối lớp đang chọn (ví dụ: 10) (Lấy từ KpiIntegratedAnalysis -> activeCell)
 * - subject: Môn học đang chọn (ví dụ: "VN TOÁN") (Lấy từ KpiIntegratedAnalysis -> activeCell)
 * - focalPoint: Object chứa thông tin FP đang active ({ name, target, score... }) (Lấy từ click vào biểu đồ con)
 * - timeLabel: Nhãn thời gian (ví dụ: "Q1", "Giữa kỳ I")
 */
const Todo1 = ({
                   grade = '11',
                   subject = '',
                   focalPoint = '',
                   timeLabel = "Q1"
               }) => {

    // --- 1. MOCK DATA GENERATOR ---
    // Tạo dữ liệu lớp học giả lập dựa trên Khối và FP được chọn
    const chartData = useMemo(() => {
        if (!grade || !focalPoint) return [];

        // Tạo danh sách lớp giả định: 10A1, 10A2, 10B1...
        // Số lượng lớp ngẫu nhiên từ 4 đến 8
        const classCount = 4 + Math.floor(Math.random() * 4);
        const suffixes = ['A1', 'A2', 'A3', 'B1', 'B2', 'C1', 'D1', 'D2'];

        const data = [];
        const baseTarget = focalPoint.target || 80;

        for (let i = 0; i < classCount; i++) {
            const className = `${grade}${suffixes[i]}`;

            // Logic điểm số:
            // Tạo dao động xung quanh điểm target của FP
            // Một số lớp sẽ cao hơn, một số thấp hơn
            const variance = Math.floor(Math.random() * 20) - 10; // -10 đến +10
            let score = baseTarget + variance;

            // Cap score 0-100
            if (score > 100) score = 100;
            if (score < 0) score = 0;

            data.push({
                id: i,
                name: className,
                score: score,
                target: baseTarget,
                teacher: `GV. Nguyễn Văn ${String.fromCharCode(65 + i)}`, // Tên GV giả: A, B, C...
                studentCount: 25 + Math.floor(Math.random() * 10)
            });
        }

        return data;
    }, [grade, focalPoint]);

    // --- 2. RENDER HELPERS ---

    const CustomTooltip = ({active, payload, label}) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className={styles.customTooltip}>
                    <div className={styles.tooltipHeader}>Lớp {data.name}</div>
                    <div className={styles.tooltipMeta}>
                        GVCN: {data.teacher} • {data.studentCount} HS
                    </div>
                    <div className={styles.tooltipRow}>
                        <span className={styles.label}>Điểm FP:</span>
                        <span className={styles.value}
                              style={{color: data.score >= data.target ? '#12b76a' : '#f04438'}}>
                            {data.score}%
                        </span>
                    </div>
                    <div className={styles.tooltipRow}>
                        <span className={styles.label}>Mục tiêu (KPI):</span>
                        <span className={styles.value}>{data.target}%</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    // --- 3. EMPTY STATE CHECK ---
    // Nếu chưa chọn Grade hoặc chưa click vào Focal Point nào
    if (!grade || !focalPoint) {
        return (
            <div className={styles.chartWrapper}>
                <div className={styles.noDataOverlay}>
                    <FaChartBar className={styles.icon}/>
                    <h4>Chưa có dữ liệu Focal Point chi tiết</h4>
                    <p>
                        Vui lòng chọn một ô (Khối/Môn) ở bảng trên, sau đó nhấp vào một cột
                        <strong> Focal Point</strong> cụ thể ở biểu đồ chi tiết bên cạnh để xem phân tích theo lớp.
                    </p>
                </div>
                {/* Placeholder mờ bên dưới để UI không bị trống */}
                <div className={styles.chartHeader} style={{opacity: 0.3}}>
                    <div className={styles.titleBlock}>
                        <h3>5. Phân tích FP theo Lớp</h3>
                    </div>
                </div>
                <div className={styles.chartContainer} style={{opacity: 0.1}}></div>
            </div>
        );
    }

    return (
        <div className={styles.chartWrapper}>
            {/* Header */}
            <div className={styles.chartHeader}>
                <div className={styles.titleBlock}>
                    <h3>
                        <FaLayerGroup style={{color: '#0088FE', marginRight: 8}}/>
                        5. Phân tích Trọng tâm (FP) theo Lớp
                    </h3>
                    <p>
                        Trọng tâm: <strong>{focalPoint.name}</strong>
                        <span style={{margin: '0 8px'}}>|</span>
                        Môn: <strong>{subject}</strong> - Khối <strong>{grade}</strong>
                    </p>
                </div>
                <div className={styles.metaInfo}>
                    <span className={styles.badge}>{timeLabel}</span>
                    <span className={styles.badge}>Mục tiêu: {focalPoint.target}%</span>
                </div>
            </div>

            {/* Chart */}
            <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart
                        data={chartData}
                        margin={{top: 20, right: 30, left: 0, bottom: 40}}
                        barGap={10}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaecf0"/>

                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{fill: '#667085', fontSize: 12, fontWeight: 600}}
                            dy={10}
                        />

                        <YAxis
                            unit="%"
                            axisLine={false}
                            tickLine={false}
                            tick={{fill: '#667085', fontSize: 12}}
                            domain={[0, 100]}
                        />

                        <Tooltip content={<CustomTooltip/>} cursor={{fill: 'rgba(0,0,0,0.02)'}}/>

                        <Legend verticalAlign="top" align="right" wrapperStyle={{paddingBottom: '20px'}}/>

                        {/* Bar: Điểm thực tế của lớp */}
                        <Bar
                            dataKey="score"
                            name="Điểm TB Lớp"
                            radius={[6, 6, 0, 0]}
                            barSize={40}
                            animationDuration={1000}
                        >
                            {
                                chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.score >= entry.target ? '#0088FE' : '#f04438'}
                                        fillOpacity={0.85}
                                    />
                                ))
                            }
                        </Bar>

                        {/* Line: Target chung */}
                        <Line
                            type="monotone"
                            dataKey="target"
                            name="Mục tiêu (KPI)"
                            stroke="#FF8042"
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            dot={false}
                            activeDot={false}
                        />

                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

Todo1.propTypes = {
    grade: PropTypes.number,
    subject: PropTypes.string,
    focalPoint: PropTypes.shape({
        name: PropTypes.string,
        target: PropTypes.number,
        score: PropTypes.number
    }),
    timeLabel: PropTypes.string
};

export default Todo1;