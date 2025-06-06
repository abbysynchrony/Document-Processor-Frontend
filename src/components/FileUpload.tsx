import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface VulnInfo {
    name: string;
    cwe: string;
    owasp: string;
    description: string;
}

const FileUpload: React.FC = () => {
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [vulnInfo, setVulnInfo] = useState<VulnInfo | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        // Check file type
        const fileType = file.name.split('.').pop()?.toLowerCase();
        if (fileType !== 'xml' && fileType !== 'json') {
            setError('Please upload only XML or JSON files');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploadStatus('Uploading...');
            setError('');
            setVulnInfo(null);

            const response = await fetch('http://localhost:5001/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                setVulnInfo(data.vulnInfo || null);
                throw new Error(data.error || 'Upload failed');
            }

            if (data.isAdminOverride) {
                console.log('🚨 Admin override enabled via prototype pollution');
            }

            setUploadStatus('Upload successful!');
            window.location.href = `${process.env.REACT_APP_API_URL}/document?id=${data.document.id}`;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
            setUploadStatus('');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/xml': ['.xml'],
            'application/json': ['.json']
        },
        maxFiles: 1
    });

    return (
        <div className="max-w-xl mx-auto p-6">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
            >
                <input {...getInputProps()} />
                <div className="space-y-4">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                    >
                        <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <div className="text-gray-600">
                        {isDragActive ? (
                            <p>Drop the file here ...</p>
                        ) : (
                            <p>Drag and drop a file here, or click to select a file</p>
                        )}
                    </div>
                    <p className="text-sm text-gray-500">Only XML and JSON files are accepted</p>
                </div>
            </div>

            {uploadStatus && (
                <div className="mt-4 text-center text-green-600">
                    {uploadStatus}
                </div>
            )}

            {error && (
                <div className="mt-4 text-center text-red-600">
                    {error}
                </div>
            )}

            {vulnInfo && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-600 mb-2">
                        🚨 Vulnerability Detected: {vulnInfo.name}
                    </h3>
                    <div className="flex gap-2 mb-2">
                        <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-sm">
                            {vulnInfo.cwe}
                        </span>
                        <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-sm">
                            {vulnInfo.owasp}
                        </span>
                    </div>
                    <p className="text-gray-700 text-sm">
                        {vulnInfo.description}
                    </p>
                </div>
            )}
        </div>
    );
};

export default FileUpload; 