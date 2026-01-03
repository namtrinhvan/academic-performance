import React, {useState, useMemo, useEffect} from 'react';
import styles from './PageReport.module.scss';
import RadioDropdown from './RadioDropdown'; // Đảm bảo đường dẫn đúng
import {
    FaChartPie,
    FaChartBar,
    FaTasks,
    FaBuilding,
    FaSchool
} from 'react-icons/fa';
import TabOverview from "./TabOverview.jsx";
import TabAnalysis from "./TabAnalysis.jsx";
import TabKpiReport from "./TabKpiReport.jsx";
import TabSetupKpi from "./TabSetupKPI.jsx";
import {IoSettingsOutline} from "react-icons/io5";
import {RiSettings3Fill} from "react-icons/ri";

const PageReport = () => {
    // --- 1. CONFIGURATION DATA ---
    const BRANDS = [
        {label: 'The Dewey Schools (TDS)', value: 'TDS'},
        {label: 'Sakura Montessori (SMIS)', value: 'SMIS'}
    ];

    // Dữ liệu giả lập các cơ sở của TDS dựa trên thực tế
    const TDS_CAMPUSES = [
        {label: 'TDS Tây Hồ Tây', value: 'THT'},
        {label: 'TDS Cầu Giấy', value: 'CG'},
        {label: 'TDS Dương Kinh', value: 'DK'},
        {label: 'TDS Ocean Park', value: 'OP'}
    ];

    const TABS = [
        {id: 'kpi-report', label: 'Báo cáo KPI', icon:<></>},
        // {id: 'overview', label: 'Tổng quan', icon: <></>},
        {id: 'analysis', label: 'Chi tiết', icon: <></>},
        {id: 'kpi-setup', label: 'Thiết lập KPI', icon: <RiSettings3Fill  />},
    ];

    // --- 2. STATE MANAGEMENT ---
    const [selectedBrand, setSelectedBrand] = useState('TDS');
    const [selectedCampus, setSelectedCampus] = useState('THT');
    const [activeTab, setActiveTab] = useState('kpi-report');

    // --- 3. LOGIC HANDLERS ---

    // Tính toán danh sách cơ sở dựa trên thương hiệu được chọn
    const currentCampusOptions = useMemo(() => {
        if (selectedBrand === 'TDS') return TDS_CAMPUSES;
        return []; // SMIS chưa có cơ sở
    }, [selectedBrand]);

    // Tự động reset cơ sở khi đổi thương hiệu
    useEffect(() => {
        if (selectedBrand === 'SMIS') {
            setSelectedCampus(null);
        } else if (selectedBrand === 'TDS') {
            setSelectedCampus('THT'); // Default về cơ sở đầu tiên hoặc cơ sở user thuộc về
        }
    }, [selectedBrand]);

    const handleBrandChange = (val) => {
        setSelectedBrand(val);
    };

    const handleCampusChange = (val) => {
        setSelectedCampus(val);
    };

    // --- 4. RENDER CONTENT ---
    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <TabOverview/>;
            case 'analysis':
                return <TabAnalysis/>;
            case 'kpi-report':
                return <TabKpiReport/>;
            case 'kpi-setup':
                return <TabSetupKpi/>;
            default:
                return null;
        }
    };

    return (
        <div className={styles.pageContainer}>
            {/* --- HEADER SECTION: FILTERS --- */}
            <div className={styles.topFilterBar}>
                <div className={styles.metadataControls}>
                    <div className={styles.filterItem}>
                        <span className={styles.filterLabel}><FaSchool/> Thương hiệu:</span>
                        <RadioDropdown
                            zIndex={1000000000}
                            className={styles.dropdown}
                            options={BRANDS}
                            value={selectedBrand}
                            onChange={handleBrandChange}
                            placeholder="Chọn hệ thống"
                        />
                    </div>

                    <div className={styles.filterItem}>
                        <span className={styles.filterLabel}><FaBuilding/> Cơ sở:</span>
                        <RadioDropdown zIndex={1000000000}
                            className={`${styles.dropdown} ${selectedBrand === 'SMIS' ? styles.disabled : ''}`}
                            options={currentCampusOptions}
                            value={selectedCampus}
                            onChange={handleCampusChange}
                            placeholder={selectedBrand === 'SMIS' ? "Chưa có dữ liệu" : "Chọn cơ sở"}
                        />
                    </div>
                </div>
            </div>
            <div className={styles.tabNavigation}>
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        className={`${styles.tabItem} ${activeTab === tab.id ? styles.active : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >{tab.icon}
                        <span className={styles.tabLabel}>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className={styles.contentArea}>
                {renderContent()}
            </div>
        </div>
    );
};

export default PageReport;