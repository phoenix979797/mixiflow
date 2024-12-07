import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import backendAxios from '../utils/backendAxios';
import { useToast } from '../context/ToastContext';
import Modal from './Modal';

const Dashboard = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [workSpaces, setWorkSpaces] = useState([]);
    const [plan, setPlan] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [workspaceName, setWorkspaceName] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }

        backendAxios.get('/plans').then(res => {
            if (res.data.length > 0) {
                setPlan(res.data[0]);
                setWorkSpaces(res.data[0]?.workspaces);
            } else {
                navigate('/create-plan');
            }
        }).catch(err => {
            console.log(err);
        });
    }, [navigate]);

    const handleCreateWorkspace = () => {
        if (workSpaces.length >= plan.workSpaceLimit) {
            showToast("You couldn't create workspace anymore", "error");
            return;
        }
        setIsModalOpen(true);
    };

    const handleSubmitWorkspace = (e) => {
        e.preventDefault();
        if (!workspaceName.trim()) {
            showToast('Please enter a workspace name', 'error');
            return;
        }

        backendAxios.post('/workspaces/create', { name: workspaceName, plan_id: plan.id })
            .then(res => {
                showToast('Workspace created successfully', 'success');
                navigate(`/edit-workspace/${res.data.id}`);
                setIsModalOpen(false);
                setWorkspaceName('');
            })
            .catch(err => {
                console.log(err);
                showToast('Something went wrong', 'error');
            });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6 mt-16">
            {plan && (
                <>
                    <div className="w-full max-w-4xl mb-8 p-6 bg-white rounded-xl shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Current Plan</h2>
                            <Link
                                to="/create-plan"
                                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                            >
                                Upgrade Plan
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-gray-500 text-sm font-medium mb-1">Workspaces</p>
                                <p className="text-xl font-bold text-gray-800">{workSpaces.length} / {plan.workSpaceLimit}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-gray-500 text-sm font-medium mb-1">Apps per Workspace</p>
                                <p className="text-xl font-bold text-gray-800">{plan.appsLimit}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-gray-500 text-sm font-medium mb-1">Tasks per App</p>
                                <p className="text-xl font-bold text-gray-800">{plan.tasksLimit}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-gray-500 text-sm font-medium mb-1">Status</p>
                                <p className="text-xl font-bold text-gray-800">{plan.status}</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full max-w-4xl mb-8">
                        <button
                            onClick={handleCreateWorkspace}
                            className={`inline-flex items-center px-6 py-2.5 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md
                                ${workSpaces.length >= plan.workSpaceLimit
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                                } text-white`}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create Workspace
                        </button>
                    </div>

                    <div className="w-full max-w-4xl overflow-hidden rounded-xl shadow-sm">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr>
                                    <th className="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apps</th>
                                    <th className="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                    <th className="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {workSpaces && workSpaces.map((workSpace) => (
                                    <tr key={workSpace.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{workSpace.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(workSpace.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => navigate(`/edit-workspace/${workSpace.id}`)}
                                                className="inline-flex items-center px-2 sm:px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                <span className="hidden sm:inline ml-2">Edit</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title="Mixiflow"
                    >
                        <form onSubmit={handleSubmitWorkspace} className="space-y-6">
                            <h1 className="text-4xl font-bold text-gray-800">Create your Workspace</h1>
                            <div>
                                <input
                                    type="text"
                                    value={workspaceName}
                                    onChange={(e) => setWorkspaceName(e.target.value)}
                                    placeholder="Name your workspace..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-200 outline-none"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full max-w-md mx-auto block py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                                <span className="flex items-center justify-center">
                                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            </button>
                        </form>
                    </Modal>
                </>
            )}
        </div>
    );
};

export default Dashboard; 