import React, {useState} from 'react';
import styles from './PageReport.module.scss';
import RadioDropdown from './RadioDropdown';
import KpiChartByGrade from "./KpiChartByGrade.jsx";
import KpiChartBySubject from "./KpiChartBySubject.jsx";
import KpiIntegratedAnalysis from "./KpiIntegratedAnalysis.jsx";
import KpiChartByClass from "./KpiChartByClass.jsx";

const TabKpiReport = () => {
    // --- 1. CONFIG DATA ---
    const KPI_TYPES = [
        {label: 'KPI TDS: Đạt PR trở lên', value: 'TDS_PR_UP'},
        {label: 'KPI TDS: Dưới EM', value: 'TDS_BELOW_EM'},
        {label: 'KPI MOET: Đạt 7.0 trở lên', value: 'MOET_7_UP'},
        {label: 'KPI MOET: Dưới 5.0', value: 'MOET_BELOW_5'},
    ];

    const PROGRAMS = [
        {label: 'Discover', value: 'Discover'},
        {label: 'Adventure', value: 'Adventure'},
        {label: 'Journey', value: 'Journey'}
    ];

    // --- 2. STATE ---
    // Lưu luôn object (label + value)
    const [selectedKpi, setSelectedKpi] = useState(KPI_TYPES[0]);
    const [selectedProgram, setSelectedProgram] = useState(PROGRAMS[0].value);

    return (
        <div className={styles.kpiContainer}>
            {/* --- TOOLBAR SECTION --- */}
            <div className={styles.kpiToolbar}>



                {/* 2. Chọn Loại KPI */}
                <div className={styles.toolbarGroupMain}>
                    <label className={styles.groupLabel}>Loại KPI:</label>
                    <RadioDropdown
                        className={styles.kpiDropdown}
                        options={KPI_TYPES}
                        // Giá trị dropdown là value, nhưng state lưu object
                        value={selectedKpi.value}
                        onChange={(val) => {
                            const found = KPI_TYPES.find(k => k.value === val);
                            setSelectedKpi(found);
                        }}
                        placeholder="Chọn loại KPI"
                    />
                </div>
                {/* 1. Chọn Chương Trình */}
                <div className={styles.toolbarGroupMain}>
                    <label className={styles.groupLabel}>Chương trình:</label>
                    <RadioDropdown
                        className={styles.kpiDropdown}
                        options={PROGRAMS}
                        value={selectedProgram}
                        onChange={(v) => setSelectedProgram(v)}
                        placeholder="Chọn chương trình"
                    />
                </div>
            </div>

            {/* --- CHARTS AREA --- */}
            <div className={styles.kpiContentArea}>
                <KpiChartByGrade
                    kpiName={selectedKpi.label}   // Dùng để hiển thị
                    kpiType={selectedKpi.value}   // Dùng để lấy dữ liệu
                    program={selectedProgram}
                />

                <KpiChartBySubject
                    kpiName={selectedKpi.label}   // Dùng để hiển thị
                    kpiType={selectedKpi.value}
                    program={selectedProgram}
                />
                <KpiChartByClass
                    kpiName={selectedKpi.label}   // Dùng để hiển thị
                    kpiType={selectedKpi.value}   // Dùng để lấy dữ liệu
                    program={selectedProgram}
                />
                <KpiIntegratedAnalysis
                    kpiName={selectedKpi.label}   // Dùng để hiển thị
                    kpiType={selectedKpi.value}   // Dùng để lấy dữ liệu
                    program={selectedProgram}
                />

            </div>
        </div>
    );
};

export default TabKpiReport;
