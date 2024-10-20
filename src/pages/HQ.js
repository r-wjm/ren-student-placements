import React, { useEffect, useState } from 'react';
import { isAuthenticated, getUserDetails } from '../API/Auth';
import { MdGetApp } from 'react-icons/md';
import '../styles/Placement.css';
import pb from '../API/PocketBase';
import * as XLSX from 'xlsx';

function HQ() {
    const [placements, setPlacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        Year: '',
        Stage: '',
        Subject: '',
        Establishment: '',
    });

    const yearOptions = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
    const stageOptions = ['Int1', 'Int2', 'Int3', 'In4', 'Int5', 'Int6', 'Na4', 'Nat5', 'Higher'];
    const subjectOptions = [
        'Mathematics', 'English', 'Physics', 'Chemistry', 
        'Computing', 'Music', 'History', 'Physical Education', 
        'Modern Studies',
    ];

    useEffect(() => {
        let isMounted = true;

        const loadAllPlacements = async () => {
            if (!isAuthenticated()) {
                if (isMounted) setError('User not authenticated');
                setLoading(false);
                return;
            }

            const userDetails = getUserDetails();
            if (userDetails.role !== 'HQ') {
                if (isMounted) setError('Access denied. HQ role required.');
                setLoading(false);
                return;
            }

            try {
                const { items } = await pb.collection('placement').getList(1, 1000, {
                    expand: 'owner',
                    sort: 'Subject',
                });

                if (isMounted) {
                    setPlacements(items.map(item => {
                        const owner = item.expand?.owner; 
                        return {
                            ...item,
                            establishment: owner?.establishment || 'Unknown', 
                        };
                    }));
                }
            } catch (err) {
                if (isMounted) setError(err.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadAllPlacements();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const applyFilters = (placements) => {
        return placements.filter((placement) => {
            return (
                (!filters.Year || placement.Year === filters.Year) &&
                (!filters.Stage || placement.Stage === filters.Stage) &&
                (!filters.Subject || placement.Subject === filters.Subject) &&
                (!filters.Establishment || placement.establishment === filters.Establishment)
            );
        });
    };

    const filteredPlacements = applyFilters(placements);

    const sortedPlacements = [...filteredPlacements].sort((a, b) => {
        return a.establishment.localeCompare(b.establishment);
    });

    const handleExportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(sortedPlacements.map(placement => ({
            Year: placement.Year,
            Stage: placement.Stage,
            Subject: placement.Subject,
            Notes: placement.notes,
            Establishment: placement.establishment,
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'All Placements');

        XLSX.writeFile(workbook, 'all_placements.xlsx');
    };

    if (loading) return <div>Loading placements...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="HQ-container">
            <h1 className="HQ-header">All Student Placements - HQ View</h1>

            <div className="HQ-filter-container">
                {Object.entries(filters).map(([key, value]) => (
                    <select key={key} name={key} value={value} onChange={handleFilterChange}>
                        <option value="">All {key}s</option>
                        {key === 'Year' && yearOptions.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                        {key === 'Stage' && stageOptions.map(stage => (
                            <option key={stage} value={stage}>{stage}</option>
                        ))}
                        {key === 'Subject' && subjectOptions.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                        ))}
                        {key === 'Establishment' && 
                            [...new Set(placements.map(p => p.establishment).filter(e => e !== 'Unknown'))].map(establishment => (
                                <option key={establishment} value={establishment}>{establishment}</option>
                            ))}
                    </select>
                ))}
            </div>

            {sortedPlacements.length > 0 ? (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Year</th>
                            <th>Stage</th>
                            <th>Subject</th>
                            <th>Notes</th>
                            <th>Establishment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPlacements.map(placement => (
                            <tr key={placement.id}>
                                <td>{placement.Year}</td>
                                <td>{placement.Stage}</td>
                                <td>{placement.Subject}</td>
                                <td>{placement.notes}</td>
                                <td>{placement.establishment}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div>No placements available.</div>
            )}

            <button className="excel-button" onClick={handleExportToExcel}>
                <MdGetApp /> Export to Excel
            </button>
        </div>
    );
}

export default HQ;
