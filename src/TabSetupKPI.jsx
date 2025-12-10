import React, {useState} from 'react';
import styles from './PageReport.module.scss';
import RadioDropdown from './RadioDropdown';
import KpiTable from './KpiTable'; // IMPORT KPI TABLE
import {FaTimes} from 'react-icons/fa';

const TabSetupKpi = () => {
    // --- 1. CONFIG DATA ---
    const KPI_TYPES = [
        {label: 'KPI TDS: Mức PR trở lên', value: 'TDS_PR_UP'}, // Positive
        {label: 'KPI TDS: Dưới mức EM', value: 'TDS_BELOW_EM'}, // Negative
        {label: 'KPI MOET: Điểm Giỏi (7.0) trở lên', value: 'MOET_7_UP'}, // Positive
        {label: 'KPI MOET: Điểm Yếu (Dưới 5.0)', value: 'MOET_BELOW_5'}, // Negative
    ];

    // --- 2. STATE MANAGEMENT ---
    const [selectedKpi, setSelectedKpi] = useState(KPI_TYPES[0].value);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <div className={styles.kpiContainer}>
            {/* --- TOOLBAR SECTION (CHỈ CÒN CHỌN LOẠI KPI) --- */}
            <div className={styles.kpiToolbar}>
                <div className={styles.toolbarGroupMain}>
                    <label className={styles.groupLabel}>Loại KPI:</label>
                    <RadioDropdown
                        className={styles.kpiDropdown}
                        options={KPI_TYPES}
                        value={selectedKpi}
                        onChange={setSelectedKpi}
                        placeholder="Chọn loại KPI"
                    />
                </div>
                <div style={{marginLeft: 'auto'}} className={styles.toolbarGroupMain}>
                    <label className={styles.groupLabel}>&nbsp;</label>
                    <button onClick={() => {
                        setIsCreateModalOpen(true)
                    }} className={styles.createKPIButton}>Tạo KPI</button>
                </div>
            </div>

            <div className={styles.kpiContentArea}>
                <KpiTable isCreateModalOpen={isCreateModalOpen} setIsCreateModalOpen={setIsCreateModalOpen}
                          kpiType={selectedKpi}/>
            </div>
        </div>
    );
};

export default TabSetupKpi;