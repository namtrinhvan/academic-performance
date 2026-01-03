import React, { useState, useEffect, useRef, useMemo } from 'react';
import styles from './TabAnalysis.module.scss';
import RadioDropdown from './RadioDropdown';
import {
    FaSearch,
    FaTimes,
    FaUserGraduate,
    FaChalkboardTeacher,
    FaLayerGroup,
    FaBook,
    FaArrowRight
} from 'react-icons/fa';

// --- 1. CONFIGURATION & MOCK DATA ---
const SCOPE_OPTIONS = [
    { label: 'Học sinh', value: 'STUDENT' },
    { label: 'Lớp học', value: 'CLASS' },
    { label: 'Khối', value: 'GRADE' },
    { label: 'Môn học', value: 'SUBJECT' },
];

// Giả lập Database để search
const MOCK_DB = {
    STUDENT: Array.from({ length: 50 }, (_, i) => ({
        id: `S${i}`,
        label: `Nguyễn Văn Học Sinh ${i + 1}`,
        sub: `Lớp 10D${(i % 5) + 1} - MS: HS00${i}`,
        type: 'STUDENT'
    })),
    CLASS: [
        { id: 'C1', label: '10 Discover 1', sub: 'Khối 10', type: 'CLASS' },
        { id: 'C2', label: '10 Adventure 2', sub: 'Khối 10 - GVCN: Thầy Nam', type: 'CLASS' },
        { id: 'C3', label: '11 Journey 1', sub: 'Khối 11 - GVCN: Cô Lan', type: 'CLASS' },
        { id: 'C4', label: '12 Discover 3', sub: 'Khối 12 - GVCN: Thầy Hùng', type: 'CLASS' },
    ],
    GRADE: Array.from({ length: 12 }, (_, i) => ({
        id: `G${i+1}`,
        label: `Khối ${i + 1}`,
        sub: 'Toàn trường',
        type: 'GRADE'
    })),
    SUBJECT: [
        { id: 'SJ1', label: 'TOÁN (VN Math)', sub: 'Ban Tự nhiên', type: 'SUBJECT' },
        { id: 'SJ2', label: 'NGỮ VĂN', sub: 'Ban Xã hội', type: 'SUBJECT' },
        { id: 'SJ3', label: 'TIẾNG ANH (ESL)', sub: 'Ngôn ngữ', type: 'SUBJECT' },
        { id: 'SJ4', label: 'VẬT LÝ', sub: 'Khoa học', type: 'SUBJECT' },
        { id: 'SJ5', label: 'HÓA HỌC', sub: 'Khoa học', type: 'SUBJECT' },
    ]
};

const TabAnalysis = () => {
    // --- 2. STATE MANAGEMENT ---
    const [searchScope, setSearchScope] = useState('CLASS');
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const searchRef = useRef(null);

    // --- 3. SEARCH LOGIC (DEBOUNCE) ---
    useEffect(() => {
        // Nếu input rỗng, clear gợi ý
        if (!searchTerm.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsSearching(true);
        setShowSuggestions(true);

        // Debounce: Chờ 300ms sau khi người dùng ngừng gõ mới tìm kiếm
        const delayDebounceFn = setTimeout(() => {
            const sourceData = MOCK_DB[searchScope] || [];
            const filtered = sourceData.filter(item =>
                item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.sub?.toLowerCase().includes(searchTerm.toLowerCase())
            );

            setSuggestions(filtered);
            setIsSearching(false);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, searchScope]);

    // --- 4. HANDLERS ---

    // Click outside để đóng suggestion
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectItem = (item) => {
        setSelectedItem(item);
        setSearchTerm(item.label); // Điền tên vào ô input
        setShowSuggestions(false);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setSuggestions([]);
        setSelectedItem(null);
        setShowSuggestions(false);
    };

    const handleScopeChange = (val) => {
        setSearchScope(val);
        setSearchTerm(''); // Reset search khi đổi đối tượng
        setSelectedItem(null);
    };

    // Helper chọn icon dựa trên loại
    const getIconByType = (type) => {
        switch (type) {
            case 'STUDENT': return <FaUserGraduate />;
            case 'CLASS': return <FaChalkboardTeacher />;
            case 'GRADE': return <FaLayerGroup />;
            case 'SUBJECT': return <FaBook />;
            default: return <FaSearch />;
        }
    };

    return (
        <div className={styles.analysisContainer}>
            <div>

            </div>
            <div className={styles.searchSection} ref={searchRef}>

                <div className={styles.searchBarWrapper}>
                    <div className={styles.scopeGroup}>
                        <RadioDropdown
                            className={styles.scopeDropdown}
                            options={SCOPE_OPTIONS}
                            value={searchScope}
                            onChange={handleScopeChange}
                        />
                    </div>
                    {/* INPUT (Chiếm ~80%) */}
                    <div className={styles.inputGroup}>
                        <div className={styles.searchIcon}>
                            {isSearching ? <div className={styles.spinner}></div> : <FaSearch />}
                        </div>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder={`Tìm kiếm tên ${SCOPE_OPTIONS.find(o => o.value === searchScope)?.label.split('(')[0]}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => {
                                if(searchTerm) setShowSuggestions(true);
                            }}
                        />
                        {searchTerm && (
                            <button className={styles.clearBtn} onClick={handleClearSearch}>
                                <FaTimes />
                            </button>
                        )}

                        {/* DROPDOWN GỢI Ý (Absolute Position) */}
                        {showSuggestions && (
                            <div className={styles.suggestionsDropdown}>
                                {suggestions.length > 0 ? (
                                    suggestions.map((item) => (
                                        <div
                                            key={item.id}
                                            className={styles.suggestionItem}
                                            onClick={() => handleSelectItem(item)}
                                        >
                                            <div className={styles.itemIcon}>{getIconByType(item.type)}</div>
                                            <div className={styles.itemContent}>
                                                <div className={styles.itemLabel}>{item.label}</div>
                                                <div className={styles.itemSub}>{item.sub}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.emptyState}>
                                        Không tìm thấy kết quả phù hợp
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* --- SECTION 2: RESULT / CONTENT AREA --- */}
            <div className={styles.resultSection}>
                {selectedItem ? (
                    <div className={styles.analysisContent}>
                        {/* Header của phần kết quả */}
                        <div className={styles.resultHeader}>
                            <div className={styles.headerIcon}>
                                {getIconByType(selectedItem.type)}
                            </div>
                            <div className={styles.headerInfo}>
                                <h2>{selectedItem.label}</h2>
                                <p>{selectedItem.sub}</p>
                            </div>
                            <div className={styles.headerActions}>
                                <button className={styles.actionBtn}>Xuất báo cáo PDF</button>
                            </div>
                        </div>
                        <div>

                        </div>
                    </div>
                ) : (
                    /* EMPTY STATE KHI CHƯA CHỌN GÌ */
                    <div className={styles.emptyAnalysisState}>
                        <div className={styles.emptyIconCircle}>
                            <FaSearch size={40} />
                        </div>
                        <h3>Chưa có đối tượng được chọn</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TabAnalysis;