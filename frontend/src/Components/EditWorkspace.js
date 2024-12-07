import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import backendAxios from '../utils/backendAxios';
import { useToast } from '../context/ToastContext';
import { useGoogleLogin } from '@react-oauth/google';

const EditWorkspace = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [workspace, setWorkspace] = useState(null);
    const { id } = useParams();

    const handleGmailSignIn = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            const countSignedInApps = () => {
                return apps.filter(app => app.signedIn).length; // Count signed-in apps
            };
            if(countSignedInApps() >= workspace.plan.appsLimit) {
                showToast('You have reached the maximum number of apps for your plan', 'error');
                return;
            }
            console.log(tokenResponse);
            showToast('Gmail connected successfully!', 'success');
            setApps(prevApps => prevApps.map(app => 
                app.type === 'gmail' ? { ...app, signedIn: true, apiKey: JSON.stringify(tokenResponse) } : app
            ));
        },
        onError: () => {
            showToast('Gmail connection failed', 'error');
        },
        scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send'
    });

    const handleGoogleDocsSignIn = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            const countSignedInApps = () => {
                return apps.filter(app => app.signedIn).length; // Count signed-in apps
            };
            if(countSignedInApps() >= workspace.plan.appsLimit) {
                showToast('You have reached the maximum number of apps for your plan', 'error');
                return;
            }
            console.log(tokenResponse);
            showToast('Google Docs connected successfully!', 'success');
            setApps(prevApps => prevApps.map(app => 
                app.type === 'googledocs' ? { ...app, signedIn: true, apiKey: JSON.stringify(tokenResponse) } : app
            ));
        },
        onError: () => {
            showToast('Google Docs connection failed', 'error');
        },
        scope: 'https://www.googleapis.com/auth/documents.readonly https://www.googleapis.com/auth/documents'
    });

    const handleGoogleSheetsSignIn = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            const countSignedInApps = () => {
                return apps.filter(app => app.signedIn).length; // Count signed-in apps
            };
            if(countSignedInApps() >= workspace.plan.appsLimit) {
                showToast('You have reached the maximum number of apps for your plan', 'error');
                return;
            }
            console.log(tokenResponse);
            showToast('Google Sheets connected successfully!', 'success');
            setApps(prevApps => prevApps.map(app => 
                app.type === 'googlesheet' ? { ...app, signedIn: true, apiKey: JSON.stringify(tokenResponse) } : app
            ));
        },
        onError: () => {
            showToast('Google Sheets connection failed', 'error');
        },
        scope: 'https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/spreadsheets'
    });

    const handleGoogleMeetSignIn = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            const countSignedInApps = () => {
                return apps.filter(app => app.signedIn).length; // Count signed-in apps
            };
            if(countSignedInApps() >= workspace.plan.appsLimit) {
                showToast('You have reached the maximum number of apps for your plan', 'error');
                return;
            }
            console.log(tokenResponse);
            showToast('Google Meet connected successfully!', 'success');
            setApps(prevApps => prevApps.map(app => 
                app.type === 'googlemeet' ? { ...app, signedIn: true, apiKey: JSON.stringify(tokenResponse) } : app
            ));
        },
        onError: () => {
            showToast('Google Meet connection failed', 'error');
        },
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events'
    });

    const handleGoogleDriveSignIn = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            const countSignedInApps = () => {
                return apps.filter(app => app.signedIn).length; // Count signed-in apps
            };
            if(countSignedInApps() >= workspace.plan.appsLimit) {
                showToast('You have reached the maximum number of apps for your plan', 'error');
                return;
            }
            console.log(tokenResponse);
            showToast('Google Drive connected successfully!', 'success');
            setApps(prevApps => prevApps.map(app => 
                app.type === 'googledrive' ? { ...app, signedIn: true, apiKey: JSON.stringify(tokenResponse) } : app
            ));
        },
        onError: () => {
            showToast('Google Drive connection failed', 'error');
        },
        scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file'
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }

        if (!id) {
            navigate('/dashboard');
            return;
        }

        backendAxios.get(`/workspaces/${id}`).then(res => {
            if (res.data) {
                setWorkspace(res.data);
            } else {
                showToast('Workspace not found', 'error');
                navigate('/dashboard');
            }
        }).catch(err => {
            console.log(err);
        });
    }, [navigate, id, showToast]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // const response = await backendAxios.post('/workspaces', {
            //     name: workspaceName,
            //     planId: plan.id
            // });
            // if (response.data) {
            //     showToast('Workspace created successfully!', 'success');
            //     navigate('/dashboard');
            // }
        } catch (err) {
            // showToast(err.response?.data?.message || 'Error creating workspace', 'error');
        }
    };

    const handleSignIn = async (appType) => {
        const countSignedInApps = () => {
            return apps.filter(app => app.signedIn).length; // Count signed-in apps
        };
        if(countSignedInApps() >= workspace.plan.appsLimit) {
            showToast('You have reached the maximum number of apps for your plan', 'error');
            return;
        }
        console.log(countSignedInApps());
        console.log(workspace.plan.appsLimit);
        // console.log(appType);
        switch (appType) {
            case 'gmail':
                if(!apps.find(app => app.type === 'gmail').signedIn) {
                    handleGmailSignIn();
                } else {
                    setApps(prevApps => prevApps.map(app => 
                        app.type === 'gmail' ? { ...app, signedIn: false } : app
                    ));
                }
                break;
            case 'googledocs':
                if(!apps.find(app => app.type === 'googledocs').signedIn) {
                    handleGoogleDocsSignIn();
                } else {
                    setApps(prevApps => prevApps.map(app => 
                        app.type === 'googledocs' ? { ...app, signedIn: false } : app
                    ));
                }
                break;
            case 'googlesheet':
                if(!apps.find(app => app.type === 'googlesheet').signedIn) {
                    handleGoogleSheetsSignIn();
                } else {
                    setApps(prevApps => prevApps.map(app => 
                        app.type === 'googlesheet' ? { ...app, signedIn: false } : app
                    ));
                }
                break;
            case 'googlemeet':
                if(!apps.find(app => app.type === 'googlemeet').signedIn) {
                    handleGoogleMeetSignIn();
                } else {
                    setApps(prevApps => prevApps.map(app => 
                        app.type === 'googlemeet' ? { ...app, signedIn: false } : app
                    ));
                }
                break;
            case 'googledrive':
                if(!apps.find(app => app.type === 'googledrive').signedIn) {
                    handleGoogleDriveSignIn();
                } else {
                    setApps(prevApps => prevApps.map(app => 
                        app.type === 'googledrive' ? { ...app, signedIn: false } : app
                    ));
                }
                break;
            default:
                break;
        }
    };

    const [apps, setApps] = useState([
        { name: 'Notion', icon: '/assets/icons/apps/notion.png', signedIn: false, type: 'notion', apiKey: '' },
        { name: 'Twitter/X', icon: '/assets/icons/apps/twitter.png', signedIn: false, type: 'twitter', apiKey: '' },
        { name: 'Instagram', icon: '/assets/icons/apps/instagram.png', signedIn: false, type: 'instagram', apiKey: '' },
        { name: 'LinkedIn', icon: '/assets/icons/apps/linkedin.png', signedIn: false, type: 'linkedin', apiKey: '' },
        { name: 'Gmail app', icon: '/assets/icons/apps/gmail.png', signedIn: false, type: 'gmail', apiKey: '' },
        { name: 'Google drive', icon: '/assets/icons/apps/googledrive.png', signedIn: false, type: 'googledrive', apiKey: '' },
        { name: 'Calendly', icon: '/assets/icons/apps/calendly.png', signedIn: false, type: 'calendly', apiKey: '' },
        { name: 'TikTok', icon: '/assets/icons/apps/tiktok.png', signedIn: false, type: 'tiktok', apiKey: '' },
        { name: 'Google docs', icon: '/assets/icons/apps/googledocs.png', signedIn: false, type: 'googledocs', apiKey: '' },
        { name: 'Google sheets', icon: '/assets/icons/apps/googlesheet.png', signedIn: false, type: 'googlesheet', apiKey: '' },
        { name: 'Microsoft teams', icon: '/assets/icons/apps/microsoftteams.png', signedIn: false, type: 'microsoftteams', apiKey: '' },
        { name: 'Microsoft word', icon: '/assets/icons/apps/word.png', signedIn: false, type: 'word', apiKey: '' },
        { name: 'Outlook', icon: '/assets/icons/apps/outlook.png', signedIn: false, type: 'outlook', apiKey: '' },
        { name: 'Slack', icon: '/assets/icons/apps/slack.png', signedIn: false, type: 'slack', apiKey: '' },
        { name: 'Cal.com', icon: '/assets/icons/apps/cal.png', signedIn: false, type: 'cal', apiKey: '' },
        { name: 'Google meet', icon: '/assets/icons/apps/googlemeet.png', signedIn: false, type: 'googlemeet', apiKey: '' },
        { name: 'Stripe', icon: '/assets/icons/apps/stripe.png', signedIn: false, type: 'stripe', apiKey: '' },
        { name: 'Whatsapp', icon: '/assets/icons/apps/whatsapp.png', signedIn: false, type: 'whatsapp', apiKey: '' }
    ]);

    useEffect(() => {
        // if (workspace?.apps) {
        //     setApps(prevApps => prevApps.map(app => ({
        //         ...app,
        //         signedIn: workspace.apps.some(wsApp => wsApp.app_type === app.type),
        //         disabled: workspace.apps.some(wsApp => wsApp.app_type === app.type)
        //     })));
        // }
    }, [workspace]);

    return (
        <div className="min-h-screen bg-white p-6 pt-24">
            <div className="max-w-6xl mx-auto">
                <Link
                    to="/dashboard"
                    className="inline-flex items-center text-gray-600 hover:text-black transition-colors mb-8"
                >
                    <span className="mr-2">←</span> Back to Dashboard
                </Link>

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">{workspace?.name}</h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {apps.map((app, index) => (
                        <div
                            key={index}
                            className="p-4 border border-gray-200 bg-gray-100 rounded-lg hover:border-gray-300 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <img
                                        src={app.icon}
                                        alt={`${app.name} icon`}
                                        className="w-10 h-6"
                                    />
                                    <span className="text-sm font-medium">{app.name}</span>
                                </div>
                                <button
                                    className={`text-sm px-1 py-0 rounded-full transition-colors w-16 h-6
                                        ${app.signedIn
                                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    onClick={() => handleSignIn(app.type)}
                                >
                                    {app.signedIn ? 'Sign out' : 'Sign in'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleSubmit}
                    className="w-full max-w-md mx-auto block py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                    <span className="flex items-center justify-center">
                        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </span>
                </button>
            </div>
        </div>
    );
};

export default EditWorkspace; 