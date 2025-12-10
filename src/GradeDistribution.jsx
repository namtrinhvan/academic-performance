import React, {useState, useMemo, useEffect} from 'react';
import CoefficientChart from "./CoefficientChart.jsx";
import ScatterPlotChart from "./ScatterPlotChart.jsx";
import styles from './GradeDistribution.module.scss';

// Import Dropdowns
import RadioDropdown from './RadioDropdown';
import CheckboxDropdown from './CheckboxDropdown';
import StackedBarChart from "./StackedBarChart.jsx";
import MoetDistributionChart from "./MoetDistributionChart.jsx";

// --- CONSTANTS (Shared) ---
const TIME_TYPES = [
    {label: 'Nửa học kỳ (Quarter)', value: 'QUARTER'},
    {label: 'Học kỳ (Semester)', value: 'SEMESTER'},
    {label: 'Cả năm (Year)', value: 'YEAR'},
];

const PROGRAMS = [
    {label: 'Discover', value: 'Discover'},
    {label: 'Adventure', value: 'Adventure'},
    {label: 'Journey', value: 'Journey'}
];

const GradeDistribution = () => {
    // --- SHARED STATE ---
    // 1. Time State
    const [timeType, setTimeType] = useState('QUARTER');
    const [selectedTime, setSelectedTime] = useState('Q1');

    // 2. Program State
    const [selectedProgram, setSelectedProgram] = useState('Discover');

    // --- SHARED LOGIC ---
    // Tính toán options cho dropdown thời gian cụ thể dựa trên timeType
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

    // Reset selectedTime về giá trị đầu tiên khi timeType thay đổi
    useEffect(() => {
        if (timeOptions.length > 0) {
            setSelectedTime(timeOptions[0].value);
        }
    }, [timeType, timeOptions]);

    return (
        <div className={styles.section}>
            <div className={styles.sectionTitle}>
                <h3>1. Phân bố điểm TDS và MOET</h3>
            </div>
            <div className={styles.container}>
                {/* --- COMMON CONTROLS --- */}
                <div className={styles.commonControls}>
                    <div className={styles.controlsRow}>
                        {/* Time Controls */}
                        <div className={styles.controlGroup}>
                            <span className={styles.label}>Thời gian:</span>
                            <div className={styles.doubleInput}>
                                <RadioDropdown
                                    className={styles.dropdownShort}
                                    options={TIME_TYPES}
                                    value={timeType}
                                    onChange={setTimeType}
                                />
                                <RadioDropdown
                                    className={styles.dropdownShort}
                                    options={timeOptions}
                                    value={selectedTime}
                                    onChange={setSelectedTime}
                                />
                            </div>
                        </div>

                        <div className={styles.separator}></div>

                        {/* Program Controls */}
                        <div className={styles.controlGroup}>
                            <span className={styles.label}>Chương trình:</span>
                            <RadioDropdown
                                className={styles.dropdownMedium}
                                options={PROGRAMS}
                                value={selectedProgram}
                                onChange={setSelectedProgram}
                                placeholder="Chọn chương trình"
                            />
                        </div>
                    </div>
                </div>

                {/* --- CHARTS AREA --- */}
                <div className={styles.charts}>
                    {/* Truyền state chung xuống các biểu đồ con */}


                    <MoetDistributionChart
                        setSelectedTime={setSelectedTime}
                        setSelectedProgram={setSelectedProgram}
                        setTimeType={setTimeType}
                        timeType={timeType}
                        selectedTime={selectedTime}
                        selectedProgram={selectedProgram}
                    />
                    <StackedBarChart setSelectedTime={setSelectedTime}
                                     setSelectedProgram={setSelectedProgram}
                                     setTimeType={setTimeType}
                                     timeType={timeType}
                                     selectedTime={selectedTime}
                                     selectedProgram={selectedProgram}
                    />
                </div>
            </div>
        </div>
    );
};

export default GradeDistribution;