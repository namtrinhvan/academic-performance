import React, {useState, useMemo, useEffect} from 'react';
import ReactECharts from 'echarts-for-react';
import {FaLayerGroup, FaArrowRight, FaTimes, FaFilter, FaChartBar} from 'react-icons/fa';
import styles from './PageReport.module.scss';
import RadioDropdown from './RadioDropdown';
import CheckboxDropdown from './CheckboxDropdown';

// --- IMPORT CÁC CHART COMPONENT ---
import KpiChartByGrade from "./KpiChartByGrade.jsx";
import KpiChartBySubject from "./KpiChartBySubject.jsx";
import KpiChartByClass from "./KpiChartByClass.jsx"; // Biểu đồ Lớp (Recharts)
import Todo1 from "./Todo1.jsx"; // Biểu đồ Todo1 cũ (nếu dùng riêng)

// --- CONSTANTS ---
const KPI_TYPES = [{label: 'KPI TDS: Đạt PR trở lên', value: 'TDS_PR_UP'}, {
    label: 'KPI TDS: Dưới EM', value: 'TDS_BELOW_EM'
}, {label: 'KPI MOET: Đạt 7.0 trở lên', value: 'MOET_7_UP'}, {label: 'KPI MOET: Dưới 5.0', value: 'MOET_BELOW_5'},];

const PROGRAMS = [{label: 'Discover', value: 'Discover'}, {label: 'Adventure', value: 'Adventure'}, {
    label: 'Journey', value: 'Journey'
}];

const TIME_OPTIONS = [{label: 'Giữa kỳ I (Q1)', value: 'Q1'}, {
    label: 'Cuối kỳ I (Q2)', value: 'Q2'
}, {label: 'Giữa kỳ II (Q3)', value: 'Q3'}, {label: 'Cuối kỳ II (Q4)', value: 'Q4'}, {
    label: 'Cả năm (Year)', value: 'YEAR'
}];

const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const SUBJECTS = ["VN TOÁN", "NGỮ VĂN", "ENGLISH", "KHTN", "LỊCH SỬ", "ĐỊA LÝ", "VẬT LÝ", "HÓA HỌC"];

// --- MOCK DATA GENERATORS (WITH TIME SIMULATION) ---
const getMockFocalPoints = (subject, timeSeed = 'Q1') => {
    const isMath = subject === 'VN TOÁN';
    const names = isMath ? ["Thống kê & XS", "Hình học", "Đại số", "Đo lường"] : [`${subject} FP1`, `${subject} FP2`, `${subject} FP3`, `${subject} FP4`];

    // Tạo biến động dữ liệu dựa trên thời gian để biểu đồ thay đổi khi chọn kỳ
    const variance = timeSeed.length * 2;

    return names.map((name, i) => {
        const baseScore = Math.floor(Math.random() * (100 - 60) + 60);
        const adjustedScore = Math.min(100, Math.max(0, baseScore + (i % 2 === 0 ? variance : -variance)));

        return {
            id: `fp-${i}-${timeSeed}`, name: name, score: adjustedScore, target: 80, time: timeSeed
        };
    });
};

const getMockPS = (fpName, timeSeed = 'Q1') => {
    const variance = timeSeed === 'Q2' ? 5 : (timeSeed === 'Q4' ? 10 : 0);
    return Array.from({length: 5}, (_, i) => ({
        id: `ps-${i}-${timeSeed}`,
        name: `PS ${i + 1} (${fpName})`,
        score: Math.min(100, Math.floor(Math.random() * (100 - 50) + 50) + variance),
        target: 80,
        time: timeSeed
    }));
};

const getMockScoreByClass = (grade, entityName, timeSeed = 'Q1') => {
    const variance = timeSeed === 'Q2' ? -5 : (timeSeed === 'Q1' ? 5 : 0);
    return Array.from({length: 6}, (_, i) => ({
        className: `${grade}A${i + 1}`,
        score: Math.min(100, Math.floor(Math.random() * (100 - 55) + 55) + variance),
        entityName: entityName,
        target: 80,
        time: timeSeed
    }));
};

/**
 * --- MAIN COMPONENT ---
 */
const TabKpiReport = () => {
    // --- GLOBAL FILTER STATE ---
    const [selectedKpi, setSelectedKpi] = useState(KPI_TYPES[0]);
    const [selectedProgram, setSelectedProgram] = useState(PROGRAMS[0].value);
    const [selectedTime, setSelectedTime] = useState('Q1'); // Thời gian cho Grid Heatmap

    // --- DRILL DOWN SELECTION STATE ---
    const [activeCell, setActiveCell] = useState(null);
    const [activeFocalPoint, setActiveFocalPoint] = useState(null);
    const [activePS, setActivePS] = useState(null);

    // --- LOCAL TIME FILTER STATES (CHO TỪNG CHART) ---
    const [fpTimes, setFpTimes] = useState([selectedTime]);
    const [todo1Times, setTodo1Times] = useState([selectedTime]);
    const [todo2Times, setTodo2Times] = useState([selectedTime]);
    const [todo3Times, setTodo3Times] = useState([selectedTime]);

    // Reset local filters khi ngữ cảnh thay đổi
    useEffect(() => {
        setFpTimes([selectedTime]);
        setTodo1Times([selectedTime]);
        setTodo2Times([selectedTime]);
        setTodo3Times([selectedTime]);
    }, [selectedTime, activeCell]);

    // --- DATA PROCESSING: GRID HEATMAP ---
    const gridData = useMemo(() => {
        return SUBJECTS.map(subject => ({
            subjectName: subject, gradesData: GRADES.map(grade => {
                const focalPoints = getMockFocalPoints(subject, selectedTime);
                const avgScore = Math.round(focalPoints.reduce((acc, curr) => acc + curr.score, 0) / focalPoints.length);
                const target = 80;
                return {
                    id: `${subject}-${grade}`,
                    grade,
                    subject,
                    avgScore,
                    target,
                    isSubjectPassed: avgScore >= target,
                    focalPoints: focalPoints.map(fp => ({...fp, isPassed: fp.score >= fp.target}))
                };
            })
        }));
    }, [selectedTime, selectedProgram]);

    // --- HANDLERS ---
    const handleCellClick = (cellData) => {
        setActiveCell(cellData);
        setActiveFocalPoint(null);
        setActivePS(null);
    };

    const onChartClick = (params, chartType) => {
        if (!params || !params.data || !params.data.rawData) return;
        const rawData = params.data.rawData;

        if (chartType === 'FOCAL_POINT') {
            setActiveFocalPoint(rawData);
            setActivePS(null);
        } else if (chartType === 'PS_LIST') {
            setActivePS(rawData);
        }
    };

    // --- ECHARTS HELPERS ---
    const generateTimeSeries = (timesArray, dataFetcher, mapToSeriesData) => {
        return timesArray.map(time => {
            const data = dataFetcher(time);
            const timeLabel = TIME_OPTIONS.find(t => t.value === time)?.label || time;
            return {
                name: timeLabel,
                type: 'bar',
                data: data.map(d => mapToSeriesData(d, time)),
                barMaxWidth: 40,
                cursor: 'pointer'
            };
        });
    };

    // 1. CHART OPTION: Focal Points
    const getFocalPointOption = () => {
        if (!activeCell) return {};
        const sampleData = getMockFocalPoints(activeCell.subject, fpTimes[0] || 'Q1');
        const xData = sampleData.map(d => d.name);

        const series = generateTimeSeries(fpTimes, (time) => getMockFocalPoints(activeCell.subject, time), (d) => ({
            value: d.score, rawData: d, itemStyle: {
                color: (activeFocalPoint?.name === d.name) ? '#004e92' : (d.score >= 80 ? '#0088FE' : '#f04438')
            }
        }));
        series.push({
            name: 'Mục tiêu',
            type: 'line',
            data: xData.map(() => 80),
            itemStyle: {color: '#FF8042'},
            lineStyle: {type: 'dashed'},
            symbol: 'none'
        });

        return {
            tooltip: {trigger: 'axis'},
            legend: {bottom: 0},
            grid: {left: '3%', right: '4%', bottom: '10%', containLabel: true},
            xAxis: {
                type: 'category', data: xData, axisLabel: {interval: 0, fontSize: 11, width: 90, overflow: 'break'}
            },
            yAxis: {type: 'value', max: 100},
            series: series
        };
    };

    // 2. CHART OPTION: TODO 1
    const getTodo1Option = () => {
        if (!activeFocalPoint) return {};
        const sampleData = getMockScoreByClass(activeCell.grade, activeFocalPoint.name, todo1Times[0] || 'Q1');
        const xData = sampleData.map(d => d.className);

        const series = generateTimeSeries(todo1Times, (time) => getMockScoreByClass(activeCell.grade, activeFocalPoint.name, time), (d) => ({
            value: d.score, itemStyle: {color: d.score >= 80 ? '#d946ef' : '#f04438'}
        }));
        series[0].markLine = {data: [{yAxis: 80, name: 'Target'}], lineStyle: {color: '#FF8042', type: 'dashed'}};

        return {
            tooltip: {trigger: 'axis'},
            legend: {bottom: 0},
            grid: {left: '3%', right: '10%', bottom: '10%', containLabel: true},
            xAxis: {type: 'category', data: xData},
            yAxis: {type: 'value', max: 100},
            series: series
        };
    };

    // 3. CHART OPTION: TODO 2
    const getTodo2Option = () => {
        if (!activeFocalPoint) return {};
        const sampleData = getMockPS(activeFocalPoint.name, todo2Times[0] || 'Q1');
        const xData = sampleData.map(d => d.name);

        const series = generateTimeSeries(todo2Times, (time) => getMockPS(activeFocalPoint.name, time), (d) => ({
            value: d.score, rawData: d, itemStyle: {color: (activePS?.name === d.name) ? '#b45309' : '#f59e0b'}
        }));

        return {
            tooltip: {trigger: 'axis'},
            legend: {bottom: 0},
            grid: {left: '3%', right: '4%', bottom: '20%', containLabel: true},
            xAxis: {type: 'category', data: xData, axisLabel: {interval: 0, rotate: 20, fontSize: 10}},
            yAxis: {type: 'value', max: 100},
            series: series
        };
    };

    // 4. CHART OPTION: TODO 3
    const getTodo3Option = () => {
        if (!activePS) return {};
        const sampleData = getMockScoreByClass(activeCell.grade, activePS.name, todo3Times[0] || 'Q1');
        const xData = sampleData.map(d => d.className);

        const series = generateTimeSeries(todo3Times, (time) => getMockScoreByClass(activeCell.grade, activePS.name, time), (d) => ({
            value: d.score, itemStyle: {color: d.score >= 80 ? '#f59e0b' : '#ef4444'}
        }));
        series[0].markLine = {data: [{yAxis: 80}], lineStyle: {color: '#FF8042', type: 'dashed'}};

        return {
            tooltip: {trigger: 'axis'},
            legend: {bottom: 0},
            grid: {left: '3%', right: '10%', bottom: '10%', containLabel: true},
            xAxis: {type: 'category', data: xData},
            yAxis: {type: 'value', max: 100},
            series: series
        };
    };

    return (<div className={styles.kpiContainer}>
        {/* --- GLOBAL TOOLBAR --- */}
        <div className={styles.kpiToolbar}>
            <div className={styles.toolbarGroupMain}>
                <label className={styles.groupLabel}>Loại KPI:</label>
                <RadioDropdown className={styles.controlDropdown} options={KPI_TYPES} value={selectedKpi.value}
                               onChange={(val) => setSelectedKpi(KPI_TYPES.find(k => k.value === val))}/>
            </div>
            <div className={styles.separator}></div>
            <div className={styles.toolbarGroupMain}>
                <label className={styles.groupLabel}>Chương trình:</label>
                <RadioDropdown className={styles.controlDropdown} options={PROGRAMS} value={selectedProgram}
                               onChange={setSelectedProgram}/>
            </div>
            <div className={styles.separator}></div>
        </div>

        {/* --- OVERVIEW CHARTS SECTION (Đã bỏ KpiChartByClass ở đây) --- */}
        <div className={styles.overviewGrid}>
            <KpiChartByGrade kpiName={selectedKpi.label} kpiType={selectedKpi.value} program={selectedProgram}/>
            <KpiChartBySubject kpiName={selectedKpi.label} kpiType={selectedKpi.value} program={selectedProgram}/>
        </div>

        {/* --- HEATMAP GRID & DRILL DOWN --- */}
        <div className={styles.heatmapSection}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <h3>3. Chi tiết KPI</h3>
                    <p>Click vào từng ô để xem các biểu đồ phân tích chi tiết</p>
                </div>
            </div>
            <div
                style={{
                    display: 'flex',
                    height: '100%',         // hoặc một chiều cao cụ thể, ví dụ '400px'
                    justifyContent: 'flex-end', // đẩy nội dung xuống cuối
                }}
            >
                <div className={styles.toolbarGroupMain}>
                    <label className={styles.groupLabel}>Thời điểm (Grid):</label>
                    <RadioDropdown className={styles.controlDropdown} options={TIME_OPTIONS} value={selectedTime}
                                   onChange={setSelectedTime}/>
                </div>
            </div>

            {/* 1. HEATMAP GRID TABLE */}
            <div className={styles.tableScrollContainer}>
                <table className={styles.excelTable} style={{width: '100%'}}>
                    <thead>
                    <tr>
                        <th className={styles.headerSubject}>Môn \ Khối</th>
                        {GRADES.map(g => <th key={g}>K{g}</th>)}
                    </tr>
                    </thead>
                    <tbody>
                    {gridData.map((row) => (<tr key={row.subjectName}>
                        <td className={styles.stickyCol}>{row.subjectName}</td>
                        {row.gradesData.map((cell) => (<td
                            key={cell.id}
                            className={`${styles.dataCell} ${cell.isSubjectPassed ? styles.success : styles.fail} ${activeCell?.id === cell.id ? styles.activeCell : ''}`}
                            onClick={() => handleCellClick(cell)}
                        >
                            <div className={styles.cellContent}>
                                <div className={styles.actualWrapper}><span
                                    className={styles.actualVal}>{cell.avgScore}%</span></div>
                                <div style={{display: 'flex', gap: '2px', marginTop: '4px'}}>
                                    {cell.focalPoints.map(fp => (<div key={fp.id} style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        backgroundColor: fp.isPassed ? '#12b76a' : '#f04438'
                                    }}/>))}
                                </div>
                            </div>
                        </td>))}
                    </tr>))}
                    </tbody>
                </table>
            </div>

            {/* 2. DRILL DOWN AREA */}
            {activeCell && (<div className={styles.analysisSection}>
                {/* Breadcrumb */}
                <div className={styles.breadcrumb}>
                            <span
                                className={styles.crumbTitle}>PHÂN TÍCH: {activeCell.subject} - K{activeCell.grade}</span>
                    {activeFocalPoint &&
                        <div className={styles.crumbItem}><FaArrowRight size={10}/> {activeFocalPoint.name}
                        </div>}
                    {activePS && <div className={styles.crumbItem}><FaArrowRight size={10}/> {activePS.name}</div>}
                </div>

                <div className={styles.drillDownBody}>

                    {/* --- NEW POSITION FOR KpiChartByClass --- */}
                    {/* Biểu đồ này sẽ xuất hiện ngay sau khi chọn ô lưới */}
                    <div className={styles.chartLevelContainer}>
                        {/* Key giúp reset component khi đổi ô activeCell */}
                        <KpiChartByClass
                            kpiName={selectedKpi.label}
                            kpiType={selectedKpi.value}
                            key={activeCell.id}
                        />
                    </div>

                    {/* --- LEVEL 2: Focal Points Chart --- */}
                    <div className={styles.chartLevelContainer}>
                        <div className={styles.chartHeader}>
                            <h5>Chi tiết Focal Points</h5>
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <CheckboxDropdown options={TIME_OPTIONS} value={fpTimes} onChange={setFpTimes}
                                                  placeholder="Chọn kỳ" zIndex={1003}/>
                                <span className={styles.chartSubInfo}>Target: {activeCell.target}%</span>
                            </div>
                        </div>
                        <ReactECharts option={getFocalPointOption()} style={{height: '350px'}}
                                      onEvents={{'click': (p) => onChartClick(p, 'FOCAL_POINT')}}/>
                    </div>

                    {/* --- LEVEL 3: Split View (Todo 1 & Todo 2) --- */}
                    {activeFocalPoint && (<div className={styles.splitChartContainer}>
                        <div className={styles.chartBox}>
                            <div className={styles.chartHeader}>
                                <h5 style={{color: '#d946ef'}}>Điểm theo Lớp ({activeFocalPoint.name})</h5>
                                <CheckboxDropdown options={TIME_OPTIONS} value={todo1Times}
                                                  onChange={setTodo1Times} zIndex={1002}/>
                            </div>
                            <ReactECharts option={getTodo1Option()} style={{height: '300px'}}/>
                        </div>

                        <div className={`${styles.chartBox} ${activePS ? styles.active : ''}`}>
                            <div className={styles.chartHeader}>
                                <h5 style={{color: '#f59e0b'}}>Điểm Power Standard</h5>
                                <CheckboxDropdown options={TIME_OPTIONS} value={todo2Times}
                                                  onChange={setTodo2Times} zIndex={1002}/>
                            </div>
                            <ReactECharts option={getTodo2Option()} style={{height: '300px'}}
                                          onEvents={{'click': (p) => onChartClick(p, 'PS_LIST')}}/>
                        </div>
                    </div>)}

                    {/* --- LEVEL 4: Todo 3 --- */}
                    {activePS && activeFocalPoint && (<div className={styles.detailChartContainer}>
                        <div className={styles.chartHeader}>
                            <h5 style={{color: '#b54708'}}>Chi tiết PS "{activePS.name}" theo Lớp</h5>
                            <div style={{display: 'flex', gap: '10px'}}>
                                <CheckboxDropdown options={TIME_OPTIONS} value={todo3Times}
                                                  onChange={setTodo3Times} zIndex={1001}/>
                                <button className={styles.closeBtn} onClick={() => setActivePS(null)}>
                                    <FaTimes/> Đóng
                                </button>
                            </div>
                        </div>
                        <ReactECharts option={getTodo3Option()} style={{height: '300px'}}/>
                    </div>)}
                </div>
            </div>)}
        </div>
    </div>);
};

export default TabKpiReport;