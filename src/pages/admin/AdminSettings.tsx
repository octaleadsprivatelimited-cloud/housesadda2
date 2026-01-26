import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Save, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Shield, 
  Loader2, 
  CheckCircle2,
  User,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { authAPI } from '@/lib/api';

const AdminSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (formData.newUsername && formData.newUsername.length < 3) {
      newErrors.newUsername = 'Username must be at least 3 characters';
    }

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (formData.confirmPassword && !formData.newPassword) {
      newErrors.confirmPassword = 'Please enter a new password first';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    if (!formData.newUsername && !formData.newPassword) {
      toast({
        title: "No Changes",
        description: "Please enter a new username or password to update",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authAPI.updateCredentials(
        formData.currentPassword,
        formData.newUsername || undefined,
        formData.newPassword || undefined
      );

      toast({
        title: "Success!",
        description: response.message || "Credentials updated successfully",
      });

      setFormData({
        currentPassword: '',
        newUsername: '',
        newPassword: '',
        confirmPassword: '',
      });

      if (formData.newUsername) {
        toast({
          title: "Username Changed",
          description: "Please login again with your new username",
        });
        setTimeout(() => {
          localStorage.removeItem('adminSession');
          navigate('/admin');
        }, 2000);
      }
    } catch (error: any) {
      let errorTitle = "Update Failed";
      let errorMessage = "Failed to update credentials. Please try again.";
      
      if (error.error) {
        errorMessage = error.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      if (errorMessage.toLowerCase().includes('current password')) {
        errorTitle = "Incorrect Current Password";
      } else if (errorMessage.toLowerCase().includes('username already exists')) {
        errorTitle = "Username Already Taken";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Compact Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          Account Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">Update your credentials</p>
      </div>

      {/* Compact Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className={`w-full px-4 py-2.5 pr-10 rounded-lg border ${
                  errors.currentPassword 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-200 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-100 outline-none text-sm`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* New Username */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              <User className="h-4 w-4 inline mr-1" />
              New Username <span className="text-xs font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.newUsername}
              onChange={(e) => setFormData({ ...formData, newUsername: e.target.value })}
              placeholder="Enter new username"
              className={`w-full px-4 py-2.5 rounded-lg border ${
                errors.newUsername 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              } focus:ring-2 focus:ring-blue-100 outline-none text-sm`}
            />
            {errors.newUsername && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.newUsername}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              <Lock className="h-4 w-4 inline mr-1" />
              New Password <span className="text-xs font-normal text-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="Enter new password"
                className={`w-full px-4 py-2.5 pr-10 rounded-lg border ${
                  errors.newPassword 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-200 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-100 outline-none text-sm`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          {formData.newPassword && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className={`w-full px-4 py-2.5 pr-10 rounded-lg border ${
                    errors.confirmPassword 
                      ? 'border-red-300 focus:border-red-500' 
                      : formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword
                      ? 'border-green-300 focus:border-green-500'
                      : 'border-gray-200 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-100 outline-none text-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.confirmPassword}
                </p>
              )}
              {formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword && !errors.confirmPassword && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Passwords match
                </p>
              )}
            </div>
          )}

          {/* Compact Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Note:</p>
                <ul className="space-y-0.5 text-blue-700">
                  <li>• Current password is required for any changes</li>
                  <li>• Changing username will log you out</li>
                  <li>• Password must be at least 6 characters</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/dashboard')}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
