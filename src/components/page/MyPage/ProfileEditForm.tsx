// @ts-nocheck
import { useState } from 'react';
import { User as UserIcon, Mail, Building2, BookOpen, Save, X } from 'lucide-react';
import { User } from '@/types';

export type ProfileEditFormProps = {
  user: User;
  onSave: (updatedProfile: Partial<User>) => Promise<void>;
  onCancel: () => void;
  className?: string;
};

export function ProfileEditForm({ user, onSave, onCancel, className = '' }: ProfileEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username,
    bio: user.bio || '',
    department: user.department,
    academicField: user.academicField,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // エラーをクリア
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'ユーザー名は必須です';
    } else if (formData.username.length > 50) {
      newErrors.username = 'ユーザー名は50文字以内で入力してください';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = '自己紹介は500文字以内で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <h2 className="text-gray-900 mb-6">プロフィール編集</h2>

      <div className="space-y-6">
        {/* ユーザー名 */}
        <div>
          <label style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
            <UserIcon className="w-4 h-4" />
            <span>ユーザー名 <span className="text-red-500">*</span></span>
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="田中太郎"
            maxLength={50}
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
          )}
        </div>

        {/* メールアドレス（表示のみ） */}
        <div>
          <label style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
            <Mail className="w-4 h-4" />
            <span>メールアドレス</span>
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            style={{
      paddingLeft: "1rem",
      paddingRight: "1rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
<<<<<<< HEAD
    }} />
          <p className={undefined}>
=======
    }}
          />
          <p className="mt-1 text-xs text-gray-500">
>>>>>>> parent of b05c270 (chore(tailwind): strip Tailwind className usages (mechanical removal for Phase 4))
            メールアドレスは変更できません
          </p>
        </div>

        {/* 所属学部 */}
        <div>
          <label style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
            <Building2 className="w-4 h-4" />
            <span>所属学部</span>
          </label>
          <input
            type="text"
            value={formData.department}
            onChange={(e) => handleChange('department', e.target.value)}
            style={{
      paddingLeft: "1rem",
      paddingRight: "1rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }}
            placeholder="工学部"
          />
        </div>

        {/* 学問分野 */}
        <div>
          <label style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
            <BookOpen className="w-4 h-4" />
            <span>学問分野</span>
          </label>
          <select
            value={formData.academicField}
            onChange={(e) => handleChange('academicField', e.target.value)}
            style={{
      paddingLeft: "1rem",
      paddingRight: "1rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }}
          >
            <option value="science">理系</option>
            <option value="humanities">文系</option>
            <option value="interdisciplinary">学際</option>
          </select>
        </div>

        {/* 自己紹介 */}
        <div>
          <label style={{
      display: "flex",
      alignItems: "center"
    }>
            <span>自己紹介</span>
            <span className="text-xs text-gray-500">
              {formData.bio.length}/500文字
            </span>
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px] ${errors.bio ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="自己紹介を入力してください..."
            maxLength={500}
          />
          {errors.bio && (
            <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
          )}
        </div>
      </div>

      {/* アクションボタン */}
      <div style={{
      display: "flex",
      gap: "0.75rem"
    }>
        <button
          type="submit"
          disabled={isLoading}
          style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      paddingLeft: "1rem",
      paddingRight: "1rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }}
        >
          <Save className="w-4 h-4" />
          <span>{isLoading ? '保存中...' : '変更を保存'}</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          style={{
      paddingLeft: "1rem",
      paddingRight: "1rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
