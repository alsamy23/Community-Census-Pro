import React from 'react';
import { AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

interface FirestoreErrorProps {
  projectId: string;
  type?: 'api' | 'permission' | 'auth';
}

import { dataService } from '../services/dataService';

export default function FirestoreError({ projectId, type = 'api' }: FirestoreErrorProps) {
  const enableUrl = `https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=${projectId}`;
  const rulesUrl = `https://console.firebase.google.com/project/${projectId}/firestore/rules`;
  const authUrl = `https://console.firebase.google.com/project/${projectId}/authentication/providers`;
  
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg w-full border border-red-100">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
            <AlertCircle size={32} />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-slate-900 mb-4">
          {projectId === 'MISSING_PROJECT_ID' ? 'Firebase Configuration Missing' :
           type === 'api' ? 'Firestore API Required' : 
           type === 'auth' ? 'Authentication Required' :
           'Database Permissions Required'}
        </h1>
        
        <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
          {projectId === 'MISSING_PROJECT_ID' ? (
            <>
              <p>
                The Firebase configuration environment variables are missing. This usually happens if the <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1 rounded">.env</span> file was deleted or not configured.
              </p>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <p className="font-bold text-slate-900">How to fix:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Open the <strong>Settings</strong> menu in AI Studio.</li>
                  <li>Go to the <strong>Secrets</strong> panel.</li>
                  <li>Add a new secret named <span className="font-mono font-bold text-brand-600">VITE_FIREBASE_PROJECT_ID</span> with your Firebase Project ID.</li>
                  <li>Add other required variables from <span className="font-mono">.env.example</span> (API Key, Auth Domain, etc.).</li>
                  <li>Or simply use <strong>Demo Mode</strong> below to explore the app with local data.</li>
                </ol>
              </div>
            </>
          ) : type === 'api' ? (
            <>
              <p>
                The Cloud Firestore API is currently disabled for your project <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1 rounded">{projectId}</span>.
              </p>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <p className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 bg-brand-600 text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                  Enable the API
                </p>
                <p>Click the button below to open the Google Cloud Console and enable the Firestore API.</p>
                <a 
                  href={enableUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-brand-600 font-bold hover:underline"
                >
                  Enable Firestore API
                  <ExternalLink size={14} />
                </a>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <p className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 bg-brand-600 text-white rounded-full flex items-center justify-center text-[10px]">2</span>
                  Create Database
                </p>
                <p>After enabling the API, go to the Firebase Console and ensure you have created a "Firestore Database" in Native mode.</p>
              </div>
            </>
          ) : type === 'auth' ? (
            <>
              <p>
                Firebase Authentication is initialized, but the <span className="font-bold text-slate-900">Anonymous</span> sign-in provider is disabled. This is required for the app to securely connect to the database.
              </p>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <p className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 bg-brand-600 text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                  Enable Anonymous Auth
                </p>
                <p>Go to the Firebase Console, click <strong>"Add new provider"</strong>, select <strong>"Anonymous"</strong>, and click <strong>Enable</strong>.</p>
                <a 
                  href={authUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-brand-600 font-bold hover:underline"
                >
                  Open Firebase Auth Settings
                  <ExternalLink size={14} />
                </a>
              </div>
            </>
          ) : (
            <>
              <p>
                Your Firestore security rules are preventing the app from reading or writing data.
              </p>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <p className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 bg-brand-600 text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                  Update Security Rules
                </p>
                <p>Go to the Firebase Console and set your rules to allow access. For development, you can use "Test Mode":</p>
                <div className="relative group">
                  <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl text-[11px] overflow-x-auto font-mono leading-relaxed">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`}
                  </pre>
                  <button 
                    onClick={(e) => {
                      const rules = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if request.auth != null;\n    }\n  }\n}`;
                      navigator.clipboard.writeText(rules);
                      const btn = e.currentTarget;
                      const originalText = btn.innerText;
                      btn.innerText = 'Copied!';
                      btn.classList.add('bg-green-600');
                      setTimeout(() => {
                        btn.innerText = originalText;
                        btn.classList.remove('bg-green-600');
                      }, 2000);
                    }}
                    className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-[10px] font-bold"
                  >
                    Copy Rules
                  </button>
                </div>
                <a 
                  href={rulesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-brand-600 font-bold hover:underline"
                >
                  Open Firestore Rules
                  <ExternalLink size={14} />
                </a>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-8">
          <button 
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-100"
          >
            <RefreshCw size={18} />
            <span>I've enabled it, refresh app</span>
          </button>
          
          <button 
            onClick={() => dataService.setDemo(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
          >
            <span>Start in Demo Mode (Local Storage)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
