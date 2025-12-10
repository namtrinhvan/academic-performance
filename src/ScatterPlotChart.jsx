import React, {useEffect, useMemo, useState} from 'react';
// Import ECharts
import ReactECharts from 'echarts-for-react';

import styles from './ScatterPlotChart.module.scss';
import RadioDropdown from './RadioDropdown';
// CheckboxDropdown không còn được sử dụng cho các trường này nữa, nhưng tôi giữ lại import nếu bạn cần dùng chỗ khác
// Nếu không, bạn có thể xóa dòng import CheckboxDropdown

// --- CONSTANTS ---
const PROGRAMS = [
    {label: 'Discover', value: 'Discover'},
    {label: 'Adventure', value: 'Adventure'},
    {label: 'Journey', value: 'Journey'}
];

const GRADE_OPTIONS = Array.from({length: 12}, (_, i) => ({
    label: `Khối ${i + 1}`,
    value: i + 1
}));

// Chỉ những môn có mapping giữa MOET và TDS mới vẽ được biểu đồ này
const MAPPED_SUBJECTS = [
    {label: "TOÁN - VN TOÁN", value: "TOAN"},
    {label: "NGỮ VĂN - VN VĂN", value: "VAN"},
    {label: "TIẾNG ANH - ENGLISH", value: "ENGLISH"},
    {label: "KHTN - VN KHTN", value: "KHTN"},
    {label: "LỊCH SỬ - VN SỬ", value: "SU"},
    {label: "ĐỊA LÝ - VN ĐỊA", value: "DIA"},
    {label: "VẬT LÝ - VN LÝ", value: "LY"},
    {label: "HÓA HỌC - VN HÓA", value: "HOA"},
    {label: "SINH HỌC - VN SINH", value: "SINH"}
];

const TIME_TYPES = [
    {label: 'Nửa học kỳ (Quarter)', value: 'QUARTER'},
    {label: 'Học kỳ (Semester)', value: 'SEMESTER'},
    {label: 'Cả năm (Year)', value: 'YEAR'},
];

const ScatterPlotChart = ({
                              timeType,
                              setTimeType,
                              setSelectedProgram,
                              setSelectedTime,
                              selectedTime,
                              selectedProgram
                          }) => {
    // --- 1. LOCAL STATE ---
    // Time Controls (Single Select) - Giữ nguyên

    // Filter Controls (Changed to Single Select for RadioDropdown)
    // Đặt giá trị mặc định là phần tử đầu tiên hoặc giá trị cụ thể
    const [selectedGrade, setSelectedGrade] = useState(10); // Mặc định Khối 10
    const [selectedSubject, setSelectedSubject] = useState('TOAN'); // Mặc định Toán

    // --- 2. DYNAMIC OPTIONS ---
    const timeOptions = useMemo(() => {
        switch (timeType) {
            case 'QUARTER':
                return [
                    {label: 'Giữa kỳ I (Q1)', value: 'Q1'}, {label: 'Cuối kỳ I (Q2)', value: 'Q2'},
                    {label: 'Giữa kỳ II (Q3)', value: 'Q3'}, {label: 'Cuối kỳ II (Q4)', value: 'Q4'}
                ];
            case 'SEMESTER':
                return [{label: 'Học kỳ I', value: 'HK1'}, {label: 'Học kỳ II', value: 'HK2'}];
            case 'YEAR':
                return [{label: 'Cả năm', value: 'YEAR'}];
            default:
                return [];
        }
    }, [timeType]);

    // Reset selectedTime khi đổi loại
    useEffect(() => {
        if (timeOptions.length > 0) setSelectedTime(timeOptions[0].value);
    }, [timeType, timeOptions]);

    // --- 3. MOCK DATA GENERATOR ---
    const chartData = useMemo(() => {
        const data = [];
        const count = 150; // Số lượng điểm mẫu

        for (let i = 0; i < count; i++) {
            // Logic cũ: Random từ mảng đã chọn.
            // Logic mới: Sử dụng trực tiếp giá trị đơn từ Radio state.

            const grade = selectedGrade;
            const program = selectedProgram;
            const subjectCode = selectedSubject;

            // Logic tạo điểm: MOET và TDS thường tương quan thuận
            // MOET: 0 - 10
            // TDS: 0 - 4.0

            // Tạo MOET ngẫu nhiên (tập trung vào khoảng 4-9)
            var moet = parseFloat((Math.random() * 6 + 3).toFixed(1)); // 3.0 -> 9.0 (có thể outlier)
            if (moet > 10) moet = 10;

            // Tạo TDS dựa trên MOET + độ lệch (variance) để tạo biểu đồ phân tán
            // Công thức giả định: TDS ~ MOET * 0.4
            let tdsBase = moet * 0.4;
            const variance = (Math.random() * 1.0) - 0.5; // Lệch +/- 0.5 điểm TDS
            let tds = parseFloat((tdsBase + variance).toFixed(2));

            // Cap range TDS
            if (tds < 0) tds = 0;
            if (tds > 4.0) tds = 4.0;

            // Tạo outlier (học sinh giỏi kỹ năng nhưng điểm thi thấp hoặc ngược lại)
            if (Math.random() < 0.05) { // 5% tỉ lệ outlier
                if (Math.random() > 0.5) {
                    tds += 1.0; // TDS cao đột biến
                } else {
                    moet += 2.0; // MOET cao đột biến
                }
            }
            // Re-cap sau khi thêm outlier
            if (tds > 4.0) tds = 4.0;
            if (moet > 10) moet = 10;

            // Mapping tên môn để hiển thị tooltip
            const subjectLabel = MAPPED_SUBJECTS.find(s => s.value === subjectCode)?.label || subjectCode;

            data.push({
                id: i,
                studentName: `Học sinh ${i + 1}`,
                grade,
                program,
                subject: subjectLabel,
                moet, // Trục X
                tds,  // Trục Y
                class: `${grade}${program?.substring(0, 1)}1` // Ví dụ: 10D1
            });
        }
        return data;
    }, [selectedGrade, selectedProgram, selectedSubject, selectedTime]);

    // --- 4. ECHARTS OPTION CONFIGURATION ---
    const getOption = useMemo(() => {
        return {
            grid: {
                top: 40,
                right: 40,
                bottom: 50,
                left: 50,
                containLabel: false // Tự căn chỉnh margin như Recharts
            },
            tooltip: {
                trigger: 'item',
                // Sử dụng formatter để tái tạo lại cấu trúc HTML của tooltip cũ
                // Lưu ý: CSS Modules styles được map vào string template
                formatter: (params) => {
                    const data = params.data;
                    // Tạo HTML string.
                    // Styles inline được sử dụng để đảm bảo hiển thị đúng nếu styles module class thay đổi
                    return `
                        <div class="${styles.customTooltip}" style="background: #fff; border: 1px solid #ccc; padding: 10px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <div class="${styles.tooltipHeader}" style="font-weight: bold; margin-bottom: 5px;">${data.studentName}</div>
                            <div class="${styles.tooltipRow}" style="font-size: 12px; margin-bottom: 3px;">Lớp: <strong>${data.class}</strong> (${data.program})</div>
                            <div class="${styles.tooltipRow}" style="font-size: 12px; margin-bottom: 5px;">Môn: <strong>${data.subject}</strong></div>
                            <div class="${styles.divider}" style="height: 1px; background: #eee; margin: 5px 0;"></div>
                            <div class="${styles.metricRow}" style="display: flex; gap: 10px; font-size: 12px;">
                                <span style="color: #0088FE">MOET: <strong>${data.moet}</strong></span>
                                <span style="color: #00C49F">TDS: <strong>${data.tds}</strong></span>
                            </div>
                        </div>
                    `;
                },
                backgroundColor: 'rgba(255, 255, 255, 0.9)', // Tránh conflict background mặc định của Echarts
                padding: 0,
                borderWidth: 0,
                shadowBlur: 0,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                extraCssText: 'box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.1); border-radius: 6px;'
            },
            xAxis: {
                type: 'value',
                name: 'Điểm MOET (0-10)',
                nameLocation: 'middle',
                nameGap: 25,
                min: 0,
                max: 10,
                interval: 1, // tickCount tương đương
                splitLine: {
                    show: true,
                    lineStyle: {
                        type: 'dashed',
                        color: '#f2f4f7'
                    }
                },
                axisLine: {show: true, lineStyle: {color: '#667085'}},
                axisTick: {show: true, lineStyle: {color: '#667085'}},
                axisLabel: {color: '#667085', fontSize: 12}
            },
            yAxis: {
                type: 'value',
                name: 'Điểm TDS (0-4.0)',
                nameLocation: 'middle',
                nameGap: 35,
                nameRotate: 90,
                min: 0,
                max: 4,
                interval: 1,
                splitLine: {
                    show: true,
                    lineStyle: {
                        type: 'dashed',
                        color: '#f2f4f7'
                    }
                },
                axisLine: {show: true, lineStyle: {color: '#667085'}},
                axisTick: {show: true, lineStyle: {color: '#667085'}},
                axisLabel: {color: '#667085', fontSize: 12}
            },
            series: [
                {
                    name: 'Học sinh',
                    type: 'scatter',
                    symbolSize: 6, // Kích thước điểm
                    itemStyle: {
                        color: '#0088FE',
                        opacity: 0.8
                    },
                    // Map data thành mảng object chứa cả thông tin meta để dùng cho tooltip
                    data: chartData.map(item => ({
                        value: [item.moet, item.tds], // [X, Y]
                        ...item // Spread toàn bộ thông tin khác (name, class, etc)
                    })),
                    // Reference Lines (MarkLines trong Echarts)
                    markLine: {
                        symbol: ['none', 'none'], // Không hiển thị mũi tên ở đầu line
                        silent: true, // Không tương tác chuột vào line
                        lineStyle: {
                            type: 'dashed',
                            color: '#d0d5dd',
                            width: 1
                        },
                        label: {
                            position: 'start', // Vị trí label
                            color: '#98a2b3',
                            fontSize: 11,
                            formatter: '{b}' // Hiển thị tên (name) của line
                        },
                        data: [
                            // Y Axis Reference Lines
                            {yAxis: 3.0, name: 'PR', label: {position: 'insideStartTop', distance: [5, 5]}},
                            {yAxis: 2.0, name: 'EM', label: {position: 'insideStartTop', distance: [5, 5]}},
                            // X Axis Reference Lines (MOET)
                            {xAxis: 5.0, name: '', label: {show: false}},
                            {xAxis: 8.0, name: '', label: {show: false}}
                        ]
                    }
                }
            ]
        };
    }, [chartData]); // Re-calculate option khi data thay đổi

    return (
        <div className={styles.chartWrapper}>
            {/* --- CONTROLS SECTION --- */}
            <div className={styles.chartControls}>

                {/* 2. Changed to RadioDropdown */}
                <div className={styles.controlGroup}>
                    <span className={styles.label}>Khối:</span>
                    <RadioDropdown
                        className={styles.dropdown}
                        options={GRADE_OPTIONS}
                        value={selectedGrade}
                        onChange={setSelectedGrade}
                        placeholder="Chọn khối"
                    />
                </div>

                {/* 3. Changed to RadioDropdown */}
                <div className={styles.controlGroup}>
                    <span className={styles.label}>Môn học:</span>
                    <RadioDropdown
                        className={styles.dropdownWide}
                        options={MAPPED_SUBJECTS}
                        value={selectedSubject}
                        onChange={setSelectedSubject}
                        placeholder="Chọn môn"
                    />
                </div>
            </div>

            {/* --- CHART SECTION (GIỮ NGUYÊN) --- */}
            <div className={styles.chartContainer}>
                <h4 className={styles.chartTitle}>
                    Biểu đồ Tương quan điểm MOET và TDS - {selectedTime}
                </h4>

                {/* ECharts Component */}
                <ReactECharts
                    option={getOption}
                    style={{height: '500px', width: '100%'}}
                    notMerge={true} // Đảm bảo update mới hoàn toàn khi data đổi
                    lazyUpdate={true}
                />
                {chartData.length === 0 && (
                    <div className={styles.noDataOverlay}>Không có dữ liệu phù hợp.</div>
                )}
            </div>
        </div>
    );
};

export default ScatterPlotChart;