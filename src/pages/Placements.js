import React, { useEffect, useState } from 'react';
import { isAuthenticated, getUserId, updatePlacement, deletePlacement, createPlacement, fetchPlacements } from '../API/Auth';
import { MdEdit, MdDelete, MdSave, MdNoteAdd, MdClose, MdGetApp } from 'react-icons/md';
import '../styles/Placement.css';
import pb from "../API/PocketBase";
import * as XLSX from 'xlsx';

function Placements() {
    const [placements, setPlacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [updatedPlacement, setUpdatedPlacement] = useState({});
    const [addingRow, setAddingRow] = useState(false);
    const [newPlacementData, setNewPlacementData] = useState({
        Year: '',
        Stage: '',
        Subject: '',
        notes: '',
    });

    const [filters, setFilters] = useState({
        Year: '',
        Stage: '',
        Subject: '',
    });

    const yearOptions = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
    const stageOptions = ['Int1', 'Int2', 'Int3', 'In4', 'Int5', 'Int6', 'Na4', 'Nat5', 'Higher'];
    const subjectOptions = [
        'Mathematics',
        'English',
        'Physics',
        'Chemistry',
        'Computing',
        'Music',
        'History',
        'Physical Education',
        'Modern Studies',
    ];

    const [modalMessage, setModalMessage] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState("");

    useEffect(() => {
        let isMounted = true;

        const loadPlacements = async () => {
            if (!isAuthenticated()) {
                if (isMounted) setError('User not authenticated');
                setLoading(false);
                return;
            }

            try {
                const records = await fetchPlacements(); 

                if (isMounted) {
                    setPlacements(records);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadPlacements();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleNewPlacement = async () => {
        try {
            const userId = getUserId();
            const data = { ...newPlacementData, owner: userId };

            if (!data.Year || !data.Stage || !data.Subject) {
                alert('Please fill in all required fields (Year, Stage, Subject)');
                return;
            }

            const newRecord = await createPlacement(data);
            setPlacements((prevPlacements) => [...prevPlacements, newRecord]);
            setAddingRow(false);
            setNewPlacementData({ Year: '', Stage: '', Subject: '', notes: '' });
            openModal('Placement added successfully.');
        } catch (err) {
            console.error('Error adding new placement:', err);
            openModal('Failed to add placement: ' + err.message);
        }
    };

    const handleEdit = (id, placement) => {
        setEditingId(id);
        setUpdatedPlacement(placement);
    };

    const handleSave = async (id) => {
        try {
            const updatedRecord = await updatePlacement(id, updatedPlacement);
            setPlacements((prevPlacements) =>
                prevPlacements.map((placement) =>
                    placement.id === id ? updatedRecord : placement
                )
            );
            setEditingId(null);
            openModal('Placement updated successfully.');
        } catch (err) {
            console.error('Error updating placement:', err);
            openModal('Failed to update placement.');
        }
    };

    const handleDelete = (id) => {
        setConfirmMessage("Are you sure you want to delete this placement?");
        setConfirmAction(() => () => deletePlacementConfirmed(id));
        setShowConfirmModal(true);
    };

    const deletePlacementConfirmed = async (id) => {
        try {
            await deletePlacement(id);
            setPlacements((prevPlacements) => prevPlacements.filter((placement) => placement.id !== id));
            openModal('Placement deleted successfully.');
        } catch (err) {
            console.error('Error deleting placement:', err);
            openModal('Failed to delete placement.');
        }
    };

    const openModal = (message) => {
        setModalMessage(message);
        setShowModal(true);
        setTimeout(() => {
            setShowModal(false);
        }, 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedPlacement({
            ...updatedPlacement,
            [name]: value,
        });
    };

    const handleNewPlacementChange = (e) => {
        const { name, value } = e.target;
        setNewPlacementData({
            ...newPlacementData,
            [name]: value,
        });
    };

    const handleCancelNewPlacement = () => {
        setAddingRow(false);
        setNewPlacementData({ Year: '', Stage: '', Subject: '', notes: '' });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: value,
        });
    };

    const applyFilters = (placements) => {
        return placements.filter((placement) => {
            return (
                (!filters.Year || placement.Year === filters.Year) &&
                (!filters.Stage || placement.Stage === filters.Stage) &&
                (!filters.Subject || placement.Subject === filters.Subject)
            );
        });
    };

    const filteredPlacements = applyFilters(placements);

    const handleExportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredPlacements.map(placement => ({
            Year: placement.Year,
            Stage: placement.Stage,
            Subject: placement.Subject,
            Notes: placement.notes,
            Establishment: pb.authStore.model.establishment,
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Placements');

        XLSX.writeFile(workbook, 'placements.xlsx');
    };

    if (loading) return <div>Loading placements...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="placements-container">
            <h1 className="placements-header">{pb.authStore.model?.establishment || "No establishment"} - Student Placements</h1>

            <div className="filter-container">
                <select name="Year" value={filters.Year} onChange={handleFilterChange}>
                    <option value="">All Years</option>
                    {yearOptions.map((year) => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
                <select name="Stage" value={filters.Stage} onChange={handleFilterChange}>
                    <option value="">All Stages</option>
                    {stageOptions.map((stage) => (
                        <option key={stage} value={stage}>{stage}</option>
                    ))}
                </select>
                <select name="Subject" value={filters.Subject} onChange={handleFilterChange}>
                    <option value="">All Subjects</option>
                    {subjectOptions.map((subject) => (
                        <option key={subject} value={subject}>{subject}</option>
                    ))}
                </select>
            </div>

            <button className="add-button" onClick={() => setAddingRow(true)}>
                <MdNoteAdd/> Add new
            </button>

            {filteredPlacements.length > 0 || addingRow ? (
                <table className="table">
                    <thead>
                    <tr>
                        <th>Year</th>
                        <th>Stage</th>
                        <th>Subject</th>
                        <th>Notes</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredPlacements.map((placement) => (
                        <tr key={placement.id}>
                            <td>
                                {editingId === placement.id ? (
                                    <select
                                        name="Year"
                                        value={updatedPlacement.Year}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Please select</option>
                                        {yearOptions.map((year) => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                ) : (
                                    placement.Year
                                )}
                            </td>
                            <td>
                                {editingId === placement.id ? (
                                    <select
                                        name="Stage"
                                        value={updatedPlacement.Stage}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Please select</option>
                                        {stageOptions.map((stage) => (
                                            <option key={stage} value={stage}>{stage}</option>
                                        ))}
                                    </select>
                                ) : (
                                    placement.Stage
                                )}
                            </td>
                            <td>
                                {editingId === placement.id ? (
                                    <select
                                        name="Subject"
                                        value={updatedPlacement.Subject}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Please select</option>
                                        {subjectOptions.map((subject) => (
                                            <option key={subject} value={subject}>{subject}</option>
                                        ))}
                                    </select>
                                ) : (
                                    placement.Subject
                                )}
                            </td>
                            <td>
                                {editingId === placement.id ? (
                                    <input
                                        type="text"
                                        name="notes"
                                        value={updatedPlacement.notes}
                                        onChange={handleInputChange}
                                    />
                                ) : (
                                    placement.notes
                                )}
                            </td>
                            <td>
                                {editingId === placement.id ? (
                                    <>
                                        <button className="save-button" onClick={() => handleSave(placement.id)}>
                                            <MdSave/>
                                        </button>
                                        <button className="close-button" onClick={() => setEditingId(null)}>
                                            <MdClose/>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="edit-button" onClick={() => handleEdit(placement.id, placement)}>
                                            <MdEdit/>
                                        </button>
                                        <button className="delete-button" onClick={() => handleDelete(placement.id)}>
                                            <MdDelete/>
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                    {addingRow && (
                        <tr>
                            <td>
                                <select name="Year" value={newPlacementData.Year} onChange={handleNewPlacementChange}>
                                    <option value="">Please select</option>
                                    {yearOptions.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <select name="Stage" value={newPlacementData.Stage} onChange={handleNewPlacementChange}>
                                    <option value="">Please select</option>
                                    {stageOptions.map((stage) => (
                                        <option key={stage} value={stage}>{stage}</option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <select name="Subject" value={newPlacementData.Subject} onChange={handleNewPlacementChange}>
                                    <option value="">Please select</option>
                                    {subjectOptions.map((subject) => (
                                        <option key={subject} value={subject}>{subject}</option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <input
                                    type="text"
                                    name="notes"
                                    value={newPlacementData.notes}
                                    onChange={handleNewPlacementChange}
                                />
                            </td>
                            <td>
                                <button className="add-new-button" onClick={handleNewPlacement}><MdSave/></button>
                                <button className="cancel-new-button" onClick={handleCancelNewPlacement}><MdClose/></button>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            ) : (
                <div>No placements available.</div>
            )}

            <button className="excel-button" onClick={handleExportToExcel}>
                <MdGetApp/> Export to Excel
            </button>

            {showModal && (
                <div className="modal-container">
                    <div className="modal-content">
                        <p>{modalMessage}</p>
                    </div>
                </div>
            )}

            {showConfirmModal && (
                <div className="modal-container">
                    <div className="modal-content">
                        <p>{confirmMessage}</p>
                        <div className="confirm-buttons">
                            <button className="confirm-yes" onClick={() => {
                                confirmAction();
                                setShowConfirmModal(false);
                            }}>Yes</button>
                            <button className="confirm-no" onClick={() => setShowConfirmModal(false)}>No</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Placements;
