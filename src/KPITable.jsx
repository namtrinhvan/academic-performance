import React, {useState, useMemo, useEffect, useRef, useLayoutEffect, useCallback, memo} from 'react';
import {createPortal} from 'react-dom';
import styles from './PageReport.module.scss';
import RadioDropdown from './RadioDropdown';
import CheckboxDropdown from './CheckboxDropdown';
import {
    FaFilter, FaLayerGroup, FaBook, FaCalendarAlt, FaPlus, FaEdit, FaSave, FaTimes, FaChartPie, FaExclamationCircle
} from 'react-icons/fa';

// --- 1. CONSTANTS ---
const PROGRAMS = ['Discover', 'Adventure', 'Journey'];
const GRADES = Array.from({length: 12}, (_, i) => i + 1);

const TDS_SUBJECTS = ["TIẾNG VIỆT", "VN VĂN", "VN VĂN - TIẾNG VIỆT", "VN KHOA HỌC XÃ HỘI VÀ NHÂN VĂN", "NGỮ VĂN", "VN LỊCH SỬ VÀ ĐỊA LÝ", "VN LỊCH SỬ", "VN ĐỊA LÝ", "VN KỸ NĂNG SỐNG", "VN GIÁO DỤC LỐI SỐNG (ĐẠO ĐỨC)", "VN CÔNG DÂN TOÀN CẦU (GIÁO DỤC CÔNG DÂN)", "VN GIÁO DỤC KINH TẾ VÀ PHÁP LUẬT", "VN KINH DOANH VÀ HƯỚNG NGHIỆP", "VN HƯỚNG NGHIỆP VÀ PHÁT TRIỂN CÁ NHÂN", "VN TOÁN", "VN KHOA HỌC TỰ NHIÊN", "VN SINH HỌC", "VN HÓA HỌC", "VN VẬT LÝ", "VN TIN HỌC", "VN CÔNG DÂN KỸ THUẬT SỐ", "VN GIÁO DỤC THỂ CHẤT", "VN NGHỆ THUẬT THỊ GIÁC (MỸ THUẬT)", "VN NGHỆ THUẬT TRÌNH DIỄN - ÂM NHẠC", "VN NGHỆ THUẬT TRÌNH DIỄN - SÂN KHẤU", "ENGLISH", "EN HUMANITIES", "EN IELTS PREP", "EN MATHEMATICS", "EN SCIENCE - MDE", "EN NATURAL SCIENCE", "EN MDE", "GIÁ TRỊ CỐT LÕI", "GIÁO DỤC CẢM XÚC XÃ HỘI (SEL)/ SINH HOẠT TẬP THỂ", "EN DIGITAL CITIZENSHIP", "EN HUMANITIES - ENGLISH", "EN HUMANITIES - SOCIAL STUDIES", "EN ALGEBRA", "EN VISUAL ARTS", "EN PERFORMING ARTS - MUSIC", "EN PERFORMING ARTS - THEATER", "EN CHEMISTRY", "EN MDE FOUNDATION", "EN MDE - LASER CRAFT", "EN MDE - IPROJECT I", "EN MDE - IPROJECT II", "EN HEALTH COURSE", "EN PHYSICS", "EN ART - STUDIO DESIGN", "EN NUTRITION", "EN SAT - MATH", "EN SAT - READING AND WRITING", "EN AP - MICRO ECONOMICS", "EN COMPUTER SCIENCE", "EN GEOMETRY", "EN AP - WORLD HISTORY - MODERN", "EN AP - PRECALCULUS", "EN MUSIC - AUDIO ENGINEERING", "EN ART - PROCESS PRINT", "EN PHOTOGRAPHY", "EN DIGITAL DESIGN", "EN FILM - PSYCHOLOGY OF CINEMA", "EN MUSIC TECHNOLOGY", "EN MUSIC THEORY", "EN MUSIC COMPOSITION", "CANVAS ONLINE - NHÂN VĂN HỌC", "CANVAS ONLINE - KHOA HỌC XÃ HỘI", "CANVAS ONLINE - KHOA HỌC MÔI TRƯỜNG", "CANVAS ONLINE - TOÁN", "WORLD LANGUAGE - JAPANESE I", "WORLD LANGUAGE - JAPANESE II", "KOREAN LANGUAGE - LITERATURE", "TIẾNG VIỆT NHƯ NGÔN NGỮ THỨ HAI", "VN VIỆT NAM HỌC", "EN GLOBAL CITIZENSHIP", "EN PHYSICAL EDUCATION", "EN WRITING", "EN TOEFL", "KR MATHEMATICS", "KR ENGLISH GRAMMAR", "EN BIOLOGY", "NGÔN NGỮ TỰ CHỌN - TIẾNG VIỆT I", "NGÔN NGỮ TỰ CHỌN - TIẾNG VIỆT II"];

const MOET_SUBJECTS = ["TOÁN", "NGỮ VĂN", "TIẾNG VIỆT", "KHOA HỌC TỰ NHIÊN", "SINH HỌC", "VẬT LÝ", "HÓA HỌC"];

const GROUP_OPTIONS = [{label: 'Nhóm theo Khối (Grade)', value: 'GRADE'}, {
    label: 'Nhóm theo Chương trình (Program)', value: 'PROGRAM'
}];

const TIME_TYPES = [{label: 'Nửa học kỳ (Quarter)', value: 'QUARTER'}, {
    label: 'Học kỳ (Semester)', value: 'SEMESTER'
}, {label: 'Cả năm (Year)', value: 'YEAR'},];

const KPI_SCORE_TYPES = [
    { label: 'Điểm MOET', value: 'MOET' },
    { label: 'Điểm TDS hệ chữ', value: 'TDS_LETTER' },
    { label: 'Điểm TDS hệ 4', value: 'TDS_GPA4' }
];

const DEFAULT_KPI_ID = 'TDS_PR_UP';
const INITIAL_KPIS = [
    { label: 'KPI TDS: Đạt PR trở lên', value: 'TDS_PR_UP', type: 'MOET' }
];

const getHeaderLabel = (item, type) => {
    if (type === 'GRADE') return `KHỐI ${item}`;
    return typeof item === 'number' ? `KHỐI ${item}` : item.toUpperCase();
};

// --- 2. SUB-COMPONENT: TOOLTIP ---
const CellTooltip = memo(({data, parentRef, onClose}) => {
    const [coords, setCoords] = useState({top: 0, left: 0});

    const updatePosition = useCallback(() => {
        if (parentRef.current) {
            const rect = parentRef.current.getBoundingClientRect();
            setCoords({
                left: rect.left + rect.width / 2, top: rect.top - 8
            });
        }
    }, [parentRef]);

    useLayoutEffect(() => {
        updatePosition();
        window.addEventListener('scroll', updatePosition, {capture: true, passive: true});
        window.addEventListener('resize', updatePosition, {passive: true});
        return () => {
            window.removeEventListener('scroll', updatePosition, {capture: true});
            window.removeEventListener('resize', updatePosition);
        };
    }, [updatePosition]);

    return createPortal(<>
        <div className={styles.tooltipBackdrop} onClick={onClose}></div>
        <div
            className={styles.tooltipCard}
            style={{top: coords.top, left: coords.left}}
            onClick={(e) => e.stopPropagation()}
        >
            <div className={styles.tooltipHeader}>
                <span className={styles.tooltipTitle}>{data.subject}</span>
            </div>
            <div className={styles.tooltipBody}>
                <div className={styles.tooltipRow}>
                    <span className={styles.label}>Khối:</span>
                    <span className={styles.value}>Khối {data.grade} - {data.program}</span>
                </div>
                <div className={styles.tooltipRow}>
                    <span className={styles.label}>Thời gian:</span>
                    <span className={styles.value}>{data.timeLabel}</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.metricRow}>
                    <div className={styles.metricItem}>
                        <span className={styles.mLabel}>KPI Mục tiêu</span>
                        <span className={styles.mValue} style={{fontSize: '1.2em', fontWeight: 'bold'}}>
                                {data.target}%
                            </span>
                    </div>
                </div>
            </div>
            <div className={styles.tooltipArrow}></div>
        </div>
    </>, document.body);
});

// --- 3. SUB-COMPONENT: CELL WRAPPER ---
const CellWrapper = memo(({
                              uniqueKey, subject, grade, program, data, isActive, onActivate, timeLabel, isEditMode, onUpdate
                          }) => {
    const cellRef = useRef(null);

    const handleClick = useCallback(() => {
        if (!isEditMode) {
            onActivate(isActive ? null : uniqueKey);
        }
    }, [isActive, uniqueKey, onActivate, isEditMode]);

    const handleInputChange = (e) => {
        const val = e.target.value;
        onUpdate(uniqueKey, val);
    };

    const targetValue = data ? data.target : '';
    const displayValue = data ? `${data.target}%` : 'N/A';

    let cellClass = styles.dataCell;
    if (isActive && !isEditMode) cellClass += ` ${styles.activeCell}`;
    if (!data && !isEditMode) cellClass += ` ${styles.emptyCellText}`;

    return (<td
        ref={cellRef}
        className={cellClass}
        onClick={handleClick}
    >
        {isEditMode ? (
            <input
                type="number"
                className={styles.cellInput}
                value={targetValue}
                placeholder="-"
                onChange={handleInputChange}
                onClick={(e) => e.stopPropagation()}
            />
        ) : (
            <div className={styles.cellContent} style={{justifyContent: 'center'}}>
                <span className={!data ? styles.naText : styles.targetVal}>
                    {displayValue}
                </span>
            </div>
        )}

        {isActive && !isEditMode && data && (<CellTooltip
            parentRef={cellRef}
            data={{subject, grade, program, target: data.target, timeLabel}}
            onClose={(e) => {
                e && e.stopPropagation();
                onActivate(null);
            }}
        />)}
    </td>);
}, (prevProps, nextProps) => {
    return (
        prevProps.isActive === nextProps.isActive &&
        prevProps.data === nextProps.data &&
        prevProps.timeLabel === nextProps.timeLabel &&
        prevProps.isEditMode === nextProps.isEditMode
    );
});

// --- 4. SUB-COMPONENT: CREATE KPI MODAL ---
const CreateKpiModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '', description: '', scoreType: KPI_SCORE_TYPES[0].value,
        upperBound: '', includeUpper: false, lowerBound: '', includeLower: false
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if(isOpen) {
            setFormData({
                name: '', description: '', scoreType: KPI_SCORE_TYPES[0].value,
                upperBound: '', includeUpper: false, lowerBound: '', includeLower: false
            });
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = () => {
        if (!formData.name.trim()) { setError('Vui lòng nhập tên KPI.'); return; }
        if (!formData.upperBound && !formData.lowerBound) { setError('Vui lòng nhập ít nhất Mức trên hoặc Mức dưới.'); return; }
        onSave(formData); onClose();
    };

    if (!isOpen) return null;

    return createPortal(
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>Tạo KPI</h3>
                    <button className={styles.closeBtn} onClick={onClose}><FaTimes /></button>
                </div>
                <div className={styles.modalBody}>
                    <div className={styles.formGroup}>
                        <label>Tên KPI <span className={styles.required}>*</span></label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nhập tên KPI..." autoFocus />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Mô tả</label>
                        <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Mô tả chi tiết..." rows={3} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Loại điểm <span className={styles.required}>*</span></label>
                        <RadioDropdown options={KPI_SCORE_TYPES} value={formData.scoreType} onChange={(val) => setFormData({...formData, scoreType: val})} className={styles.modalDropdown} />
                    </div>
                    <div className={styles.boundsContainer}>
                        <div className={styles.boundGroup}>
                            <label>Mức trên</label>
                            <div className={styles.inputWithCheck}>
                                <input type="number" value={formData.upperBound} onChange={e => setFormData({...formData, upperBound: e.target.value})} placeholder="Giá trị..." />
                                <label className={styles.checkLabel}>
                                    <input type="checkbox" checked={formData.includeUpper} onChange={e => setFormData({...formData, includeUpper: e.target.checked})} /> Bao gồm
                                </label>
                            </div>
                        </div>
                        <div className={styles.boundGroup}>
                            <label>Mức dưới</label>
                            <div className={styles.inputWithCheck}>
                                <input type="number" value={formData.lowerBound} onChange={e => setFormData({...formData, lowerBound: e.target.value})} placeholder="Giá trị..." />
                                <label className={styles.checkLabel}>
                                    <input type="checkbox" checked={formData.includeLower} onChange={e => setFormData({...formData, includeLower: e.target.checked})} /> Bao gồm
                                </label>
                            </div>
                        </div>
                    </div>
                    {error && <div className={styles.errorMsg}>{error}</div>}
                </div>
                <div className={styles.modalFooter}>
                    <button className={styles.btnCancel} onClick={onClose}>Hủy</button>
                    <button className={styles.btnSave} onClick={handleSubmit}>Lưu KPI</button>
                </div>
            </div>
        </div>, document.body
    );
};

// --- 5. SUB-COMPONENT: SAVE CONFIRM MODAL (NEW) ---
const SaveConfirmModal = ({ isOpen, onClose, onConfirm, timeOptions, currentTimeValue }) => {
    const [applyTimes, setApplyTimes] = useState([]);

    // Lọc bỏ thời gian hiện tại ra khỏi danh sách tùy chọn
    const availableOptions = useMemo(() => {
        return timeOptions.filter(t => t.value !== currentTimeValue);
    }, [timeOptions, currentTimeValue]);

    useEffect(() => {
        if(isOpen) setApplyTimes([]); // Reset khi mở lại
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className={styles.modalOverlay}>
            <div className={`${styles.modalContent} ${styles.modalSmall}`}>
                <div className={styles.modalHeader}>
                    <h3><FaSave /> Lưu Thay Đổi</h3>
                    <button className={styles.closeBtn} onClick={onClose}><FaTimes /></button>
                </div>
                <div className={styles.modalBody}>
                    <p className={styles.confirmText}>
                        Bạn đang lưu cấu hình KPI cho thời gian: <strong>{timeOptions.find(t => t.value === currentTimeValue)?.label}</strong>.
                    </p>

                    <div className={styles.applySection}>
                        <label className={styles.sectionLabel}>
                            <FaExclamationCircle className={styles.iconInfo} /> Áp dụng thêm cho:
                        </label>
                        {availableOptions.length > 0 ? (
                            <CheckboxDropdown
                                options={availableOptions}
                                value={applyTimes}
                                onChange={setApplyTimes}
                                placeholder="Chọn thời gian khác..."
                                className={styles.modalDropdown}
                                maxDisplayTags={2}
                                zIndex={100000000}
                            />
                        ) : (
                            <div className={styles.emptyNote}>Không còn mốc thời gian nào khác.</div>
                        )}
                        <p className={styles.hintText}>
                            Dữ liệu hiện tại sẽ được sao chép sang các mốc thời gian được chọn.
                        </p>
                    </div>
                </div>
                <div className={styles.modalFooter}>
                    <button className={styles.btnCancel} onClick={onClose}>Hủy bỏ</button>
                    <button
                        className={styles.btnSave}
                        onClick={() => onConfirm(applyTimes)}
                    >
                        Lưu & Áp dụng
                    </button>
                </div>
            </div>
        </div>, document.body
    );
};

// --- 6. MAIN COMPONENT ---
const KpiTable = ({kpiType, isCreateModalOpen, setIsCreateModalOpen}) => {
    // --- STATE ---
    const [groupBy, setGroupBy] = useState('PROGRAM');
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [activeCellKey, setActiveCellKey] = useState(null);
    const [timeType, setTimeType] = useState('QUARTER');
    const [selectedTime, setSelectedTime] = useState('Q1');

    // UI Logic State
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    // Data Logic State
    const [kpiList, setKpiList] = useState(INITIAL_KPIS);
    const [selectedKpiId, setSelectedKpiId] = useState(DEFAULT_KPI_ID);
    const [kpiDataStore, setKpiDataStore] = useState({});

    // --- MEMOIZED OPTIONS ---
    const timeOptions = useMemo(() => {
        switch (timeType) {
            case 'QUARTER': return [{label: 'Giữa kỳ I (Q1)', value: 'Q1'}, {label: 'Cuối kỳ I (Q2)', value: 'Q2'}, {label: 'Giữa kỳ II (Q3)', value: 'Q3'}, {label: 'Cuối kỳ II (Q4)', value: 'Q4'}];
            case 'SEMESTER': return [{label: 'Học kỳ I', value: 'HK1'}, {label: 'Học kỳ II', value: 'HK2'}];
            case 'YEAR': return [{label: 'Cả năm học', value: 'FULL_YEAR'}];
            default: return [];
        }
    }, [timeType]);

    useEffect(() => {
        if (timeOptions.length > 0) setSelectedTime(timeOptions[0].value);
    }, [timeType, timeOptions]);

    const subjectsList = useMemo(() => {
        if (!kpiType) return TDS_SUBJECTS;
        return kpiType.includes('MOET') ? MOET_SUBJECTS : TDS_SUBJECTS;
    }, [kpiType]);

    // --- INIT DATA ---
    useEffect(() => {
        if (!kpiDataStore[DEFAULT_KPI_ID]) {
            const defaultData = {};
            subjectsList.forEach(subject => {
                defaultData[subject] = {};
                GRADES.forEach(grade => {
                    defaultData[subject][grade] = {};
                    PROGRAMS.forEach(prog => {
                        // Mock data for Default KPI
                        if(Math.random() > 0.3) {
                            defaultData[subject][grade][prog] = { target: 80 + Math.floor(Math.random() * 10 - 5) };
                        } else {
                            defaultData[subject][grade][prog] = null;
                        }
                    });
                });
            });
            setKpiDataStore(prev => ({ ...prev, [DEFAULT_KPI_ID]: defaultData }));
        }
    }, [subjectsList]);

    const currentGridData = useMemo(() => {
        return kpiDataStore[selectedKpiId] || {};
    }, [kpiDataStore, selectedKpiId]);

    // --- ACTIONS ---
    const handleCreateKpi = (newKpiFormData) => {
        const newId = `kpi_${Date.now()}`;
        const newKpiOption = {
            label: newKpiFormData.name,
            value: newId,
            type: newKpiFormData.scoreType
        };
        setKpiList(prev => [...prev, newKpiOption]);
        setKpiDataStore(prev => ({ ...prev, [newId]: {} })); // Init empty data
        setSelectedKpiId(newId);
        setIsEditMode(true); // Auto switch to edit mode for convenience
        alert(`Đã tạo KPI: ${newKpiFormData.name}. Vui lòng nhập dữ liệu.`);
    };

    const updateGridValue = useCallback((subject, gradeKey, progKey, val) => {
        setKpiDataStore(prevStore => {
            const currentStore = prevStore[selectedKpiId] || {};
            const newData = { ...currentStore };
            if (!newData[subject]) newData[subject] = {};
            if (!newData[subject][gradeKey]) newData[subject][gradeKey] = {};

            if (val === '') {
                newData[subject][gradeKey][progKey] = null;
            } else {
                newData[subject][gradeKey][progKey] = { target: parseInt(val) || 0 };
            }

            return { ...prevStore, [selectedKpiId]: newData };
        });
    }, [selectedKpiId]);

    // Nút Lưu trên toolbar -> Mở modal xác nhận
    const handleToolbarSaveClick = () => {
        if (isEditMode) {
            setIsSaveModalOpen(true);
        } else {
            setIsEditMode(true);
        }
    };

    // Xác nhận lưu trong Modal
    const handleConfirmSave = (applyTimes) => {
        console.log("Saving KPI Data for:", selectedKpiId);
        console.log("Current Time:", selectedTime);
        console.log("Applying to additional times:", applyTimes);

        // Logic giả lập: Nếu có Backend, ta sẽ gửi { kpiId, data, timePeriods: [current, ...applyTimes] }

        let message = "Đã lưu cấu hình KPI thành công!";
        if(applyTimes.length > 0) {
            const labels = timeOptions.filter(t => applyTimes.includes(t.value)).map(t => t.label).join(', ');
            message += `\nĐã áp dụng thêm cho: ${labels}`;
        }

        alert(message);
        setIsSaveModalOpen(false);
        setIsEditMode(false);
    };

    // --- VIEW HELPERS ---
    const columnOptions = useMemo(() => {
        if (groupBy === 'GRADE') return GRADES.map(g => ({label: `Khối ${g}`, value: g}));
        return PROGRAMS.map(p => ({label: p, value: p}));
    }, [groupBy]);

    const subjectOptions = useMemo(() => {
        return subjectsList.map(s => ({label: s, value: s}));
    }, [subjectsList]);

    const visibleMainColumns = useMemo(() => {
        let allCols = groupBy === 'GRADE' ? GRADES : PROGRAMS;
        if (selectedColumns.length > 0) return allCols.filter(c => selectedColumns.includes(c));
        return allCols;
    }, [groupBy, selectedColumns]);

    const visibleSubjects = useMemo(() => {
        if (selectedSubjects.length > 0) return subjectsList.filter(s => selectedSubjects.includes(s));
        return subjectsList;
    }, [subjectsList, selectedSubjects]);

    const subColumns = useMemo(() => {
        return groupBy === 'GRADE' ? PROGRAMS : GRADES;
    }, [groupBy]);

    const getSelectedTimeLabel = useCallback(() => {
        const found = timeOptions.find(o => o.value === selectedTime);
        return found ? found.label : selectedTime;
    }, [timeOptions, selectedTime]);

    const currentTimeLabel = getSelectedTimeLabel();

    return (<div className={styles.tableWrapper}>
        {/* --- CONTROLS BAR --- */}
        <div className={styles.tableControls}>
            <div className={styles.controlGroup}>
                <span className={styles.controlLabel}><FaCalendarAlt/> Thời gian:</span>
                <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                    <RadioDropdown
                        className={styles.timeTypeDropdown}
                        style={{minWidth: 120}}
                        options={TIME_TYPES}
                        value={timeType}
                        onChange={setTimeType}
                    />
                    <RadioDropdown
                        className={styles.timeValueDropdown}
                        style={{minWidth: 160}}
                        options={timeOptions}
                        value={selectedTime}
                        onChange={setSelectedTime}
                    />
                </div>
            </div>
            <div style={{marginLeft: 'auto'}} className={styles.controlGroup}>
                <label>&nbsp;</label>
                <button
                    className={`${styles.actionBtn} ${isEditMode ? styles.btnSaveMode : styles.btnEditMode}`}
                    onClick={handleToolbarSaveClick}
                >
                    {isEditMode ? <><FaSave/> Lưu KPI</> : <><FaEdit/> Sửa</>}
                </button>
            </div>
        </div>

        {/* --- TABLE AREA --- */}
        <div className={styles.tableScrollContainer}>
            <table className={styles.excelTable}>
                <thead>
                <tr>
                    <th rowSpan={2} className={`${styles.stickyCol} ${styles.headerSubject}`}>
                        MÔN HỌC ({visibleSubjects.length})
                    </th>
                    {visibleMainColumns.map((colItem) => (
                        <th key={colItem} colSpan={subColumns.length} className={styles.headerMain}>
                            {getHeaderLabel(colItem, groupBy)}
                        </th>))}
                </tr>
                <tr>
                    {visibleMainColumns.map((colItem) => (subColumns.map((subItem) => (
                        <th key={`${colItem}-${subItem}`} className={styles.headerSub}>
                            {groupBy === 'GRADE' ? subItem.substring(0, 3).toUpperCase() : subItem}
                        </th>))))}
                </tr>
                </thead>
                <tbody>
                {visibleSubjects.map((subject) => (<tr key={subject}>
                    <td className={styles.stickyCol}>
                        {subject}
                    </td>
                    {visibleMainColumns.map((colItem) => (subColumns.map((subItem) => {
                        let gradeKey, progKey;
                        if (groupBy === 'GRADE') {
                            gradeKey = colItem;
                            progKey = subItem;
                        } else {
                            gradeKey = subItem;
                            progKey = colItem;
                        }

                        const uniqueKey = `${subject}-${gradeKey}-${progKey}`;
                        const cellData = currentGridData[subject]?.[gradeKey]?.[progKey];
                        const isActive = activeCellKey === uniqueKey;

                        return (<CellWrapper
                            key={uniqueKey}
                            uniqueKey={uniqueKey}
                            subject={subject}
                            grade={gradeKey}
                            program={progKey}
                            data={cellData}
                            isActive={isActive}
                            onActivate={(k) => setActiveCellKey(k)}
                            timeLabel={currentTimeLabel}
                            isEditMode={isEditMode}
                            onUpdate={(k, val) => updateGridValue(subject, gradeKey, progKey, val)}
                        />);
                    })))}
                </tr>))}
                </tbody>
            </table>
        </div>

        {/* MODALS */}
        <CreateKpiModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateKpi}
        />

        <SaveConfirmModal
            isOpen={isSaveModalOpen}
            onClose={() => setIsSaveModalOpen(false)}
            onConfirm={handleConfirmSave}
            timeOptions={timeOptions}
            currentTimeValue={selectedTime}
        />
    </div>);
};

export default KpiTable;