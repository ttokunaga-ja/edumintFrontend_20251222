import React, { useState } from 'react';
import { useJobStore } from '../../../stores/jobStore';
import { useWebSocket } from '../../../hooks/useWebSocket';

const ProblemGenerator: React.FC = () => {
  const { jobId, phase, data, error } = useJobStore();
  const [skipReview, setSkipReview] = useState(false); // 構造確認スキップ
  const [autoPublish, setAutoPublish] = useState(false); // 自動公開
  useWebSocket(jobId);

  const handleUpload = async (file: File) => {
    // アップロードAPI呼び出し（edumintGateway経由）
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
    });
    const { jobId: newJobId } = await response.json();
    useJobStore.getState().setJob(newJobId);
  };

  const handleConfirmStructure = () => {
    // 構造確定API（オプション修正後）
    fetch(`/api/jobs/${jobId}/confirm`, { method: 'POST' });
  };

  const handlePublish = () => {
    // 自動公開API
    fetch(`/api/jobs/${jobId}/publish`, { method: 'POST' });
  };

  return (
    <div>
      {error && <p>Error: {error}</p>}
      {phase === 'idle' && (
        <div>
          <input type="file" onChange={(e) => e.target.files && handleUpload(e.target.files[0])} />
          <label><input type="checkbox" checked={skipReview} onChange={(e) => setSkipReview(e.target.checked)} /> 構造確認をスキップ</label>
          <label><input type="checkbox" checked={autoPublish} onChange={(e) => setAutoPublish(e.target.checked)} /> 生成後自動公開</label>
        </div>
      )}
      {phase === 'Structure_uploading' && <p>ファイルをアップロード中...</p>}
      {phase === 'Structure_parsing' && <p>構造を解析中...</p>}
      {phase === 'Structure_confirmed' && !skipReview && (
        <div>
          <p>構造確認: {JSON.stringify(data)}</p>
          <button onClick={handleConfirmStructure}>確定</button>
        </div>
      )}
      {phase === 'Generation_creating' && <p>問題を生成中...</p>}
      {phase === 'Generation_completed' && (
        <div>
          <p>生成完了: {JSON.stringify(data)}</p>
          {!autoPublish && <button onClick={handlePublish}>公開</button>}
        </div>
      )}
      {(phase === 'Structure_failed' || phase === 'Generation_failed') && (
        <div>
          <p>失敗しました。リトライしてください。</p>
          <button onClick={() => window.location.reload()}>リトライ</button>
        </div>
      )}
    </div>
  );
};

export default ProblemGenerator;