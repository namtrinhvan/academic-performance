import React from 'react';
import styles from './PageReport.module.scss';
import {FaFilter, FaExpand, FaEllipsisH, FaCalendarAlt} from 'react-icons/fa';
import ScatterPlotChart from "./ScatterPlotChart.jsx";
import CoefficientChart from "./CoefficientChart.jsx";
import StackedBarChart from "./StackedBarChart.jsx";
import MoetDistributionChart from "./MoetDistributionChart.jsx";
import GradeCorrelation from "./GradeCorrelation.jsx";
import GradeDistribution from "./GradeDistribution.jsx";


// --- MAIN COMPONENT: TabOverview ---
const TabOverview = () => {
    return (
        <div className={styles.overviewGrid}>
            {/*<GradeDistribution/>*/}
            <GradeCorrelation/>
        </div>
    );
};

export default TabOverview;