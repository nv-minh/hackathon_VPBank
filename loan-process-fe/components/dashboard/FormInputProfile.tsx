"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FormInputProfileProps {
    onProfileCreated: (profileId: string) => void;
}

export function FormInputProfile({ onProfileCreated }: FormInputProfileProps) {
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        person_age: '',
        person_income: '',
        person_home_ownership: '',
        person_emp_length: '',
        loan_intent: '',
        loan_grade: '',
        loan_amnt: '',
        loan_int_rate: '',
        loan_percent_income: '',
        cb_person_default_on_file: '',
        cb_person_cred_hist_length: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        if (errors[id]) { // Xóa lỗi khi người dùng bắt đầu nhập
            setErrors(prev => ({ ...prev, [id]: '' }));
        }
    };

    const handleSelectChange = (id: string, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
        if (errors[id]) {
            setErrors(prev => ({ ...prev, [id]: '' }));
        }
    };

    const validateForm = () => {
        let newErrors: Record<string, string> = {};
        // Ví dụ validation đơn giản
        if (!formData.person_age || parseInt(formData.person_age) <= 0) newErrors.person_age = "Vui lòng nhập tuổi hợp lệ.";
        if (!formData.person_income || parseFloat(formData.person_income.replace(/\./g, '')) <= 0) newErrors.person_income = "Vui lòng nhập thu nhập hợp lệ.";
        if (!formData.person_home_ownership) newErrors.person_home_ownership = "Vui lòng chọn tình trạng nhà ở.";
        if (!formData.person_emp_length || parseFloat(formData.person_emp_length) < 0) newErrors.person_emp_length = "Vui lòng nhập số năm làm việc hợp lệ.";
        if (!formData.loan_intent) newErrors.loan_intent = "Vui lòng chọn mục đích vay.";
        if (!formData.loan_amnt || parseFloat(formData.loan_amnt.replace(/\./g, '')) <= 0) newErrors.loan_amnt = "Vui lòng nhập số tiền vay hợp lệ.";
        if (!formData.cb_person_default_on_file) newErrors.cb_person_default_on_file = "Vui lòng xác nhận lịch sử nợ quá hạn.";
        if (!formData.cb_person_cred_hist_length || parseInt(formData.cb_person_cred_hist_length) < 0) newErrors.cb_person_cred_hist_length = "Vui lòng nhập lịch sử tín dụng hợp lệ.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            toast({
                title: "Lỗi nhập liệu",
                description: "Vui lòng kiểm tra lại các trường thông tin.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        // Chuẩn bị dữ liệu để gửi đi, chuyển đổi sang định dạng số nếu cần
        const payload = {
            age: parseInt(formData.person_age),
            income: parseFloat(formData.person_income.replace(/\./g, '')),
            home_ownership: formData.person_home_ownership,
            employment_length_years: parseFloat(formData.person_emp_length),
            loan_intent: formData.loan_intent,
            // loan_grade và interest_rate có thể được tính toán ở backend
            loan_grade: formData.loan_grade || null, // Có thể gửi null nếu không chọn
            interest_rate: formData.loan_int_rate ? parseFloat(formData.loan_int_rate) : null,
            loan_amount: parseFloat(formData.loan_amnt.replace(/\./g, '')),
            percent_income: formData.loan_percent_income ? parseFloat(formData.loan_percent_income) : null,
            default_on_file: formData.cb_person_default_on_file === 'yes' ? 'Y' : 'N', // Chuyển đổi sang Y/N
            credit_history_length_years: parseInt(formData.cb_person_cred_hist_length)
        };

        try {
            const response = await fetch('/api/create-profile', { // API route mới để tạo profile
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Thành công!",
                    description: "Hồ sơ vay vốn của bạn đã được tạo.",
                });
                onProfileCreated(data.profileId); // Gọi callback để DashboardContent biết và cập nhật
            } else {
                toast({
                    title: "Lỗi",
                    description: `Không thể tạo hồ sơ: ${data.message || 'Lỗi không xác định'}`,
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error submitting profile:", error);
            toast({
                title: "Lỗi kết nối",
                description: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrencyInput = (value: string) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        if (!numericValue) return "";
        return new Intl.NumberFormat('vi-VN').format(Number(numericValue));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-bold text-red-600 mb-2">
                    Bạn chưa có hồ sơ vay vốn!
                </CardTitle>
                <CardDescription className="text-gray-700">
                    Vui lòng điền thông tin dưới đây để tạo hồ sơ và bắt đầu đăng ký khoản vay.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Thông tin cá nhân */}
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4">Thông tin cá nhân</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="person_age">Tuổi</Label>
                            <Input
                                id="person_age"
                                type="number"
                                placeholder="Ví dụ: 25"
                                value={formData.person_age}
                                onChange={handleChange}
                                className={errors.person_age ? "border-red-500" : ""}
                            />
                            {errors.person_age && <p className="text-red-500 text-xs">{errors.person_age}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="person_income">Thu nhập hàng năm (VNĐ)</Label>
                            <Input
                                id="person_income"
                                type="text" // Để định dạng tiền tệ
                                placeholder="Ví dụ: 120.000.000"
                                value={formatCurrencyInput(formData.person_income)}
                                onChange={handleChange}
                                className={errors.person_income ? "border-red-500" : ""}
                            />
                            {errors.person_income && <p className="text-red-500 text-xs">{errors.person_income}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="person_home_ownership">Tình trạng nhà ở</Label>
                            <Select onValueChange={(val) => handleSelectChange('person_home_ownership', val)} value={formData.person_home_ownership}>
                                <SelectTrigger className={errors.person_home_ownership ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Chọn tình trạng nhà ở" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="RENT">Thuê</SelectItem>
                                    <SelectItem value="OWN">Sở hữu</SelectItem>
                                    <SelectItem value="MORTGAGE">Đang thế chấp</SelectItem>
                                    <SelectItem value="OTHER">Khác</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.person_home_ownership && <p className="text-red-500 text-xs">{errors.person_home_ownership}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="person_emp_length">Số năm làm việc (ước tính)</Label>
                            <Input
                                id="person_emp_length"
                                type="number"
                                step="0.5"
                                placeholder="Ví dụ: 5.5"
                                value={formData.person_emp_length}
                                onChange={handleChange}
                                className={errors.person_emp_length ? "border-red-500" : ""}
                            />
                            {errors.person_emp_length && <p className="text-red-500 text-xs">{errors.person_emp_length}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cb_person_default_on_file">Từng có nợ quá hạn?</Label>
                            <Select onValueChange={(val) => handleSelectChange('cb_person_default_on_file', val)} value={formData.cb_person_default_on_file}>
                                <SelectTrigger className={errors.cb_person_default_on_file ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Chọn" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Có</SelectItem>
                                    <SelectItem value="no">Không</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.cb_person_default_on_file && <p className="text-red-500 text-xs">{errors.cb_person_default_on_file}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cb_person_cred_hist_length">Lịch sử tín dụng (số năm)</Label>
                            <Input
                                id="cb_person_cred_hist_length"
                                type="number"
                                placeholder="Ví dụ: 3"
                                value={formData.cb_person_cred_hist_length}
                                onChange={handleChange}
                                className={errors.cb_person_cred_hist_length ? "border-red-500" : ""}
                            />
                            {errors.cb_person_cred_hist_length && <p className="text-red-500 text-xs">{errors.cb_person_cred_hist_length}</p>}
                        </div>
                    </div>

                    {/* Thông tin khoản vay */}
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4 pt-4">Thông tin khoản vay mong muốn</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="loan_amnt">Số tiền muốn vay (VNĐ)</Label>
                            <Input
                                id="loan_amnt"
                                type="text" // Để định dạng tiền tệ
                                placeholder="Ví dụ: 50.000.000"
                                value={formatCurrencyInput(formData.loan_amnt)}
                                onChange={handleChange}
                                className={errors.loan_amnt ? "border-red-500" : ""}
                            />
                            {errors.loan_amnt && <p className="text-red-500 text-xs">{errors.loan_amnt}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="loan_intent">Mục đích vay</Label>
                            <Select onValueChange={(val) => handleSelectChange('loan_intent', val)} value={formData.loan_intent}>
                                <SelectTrigger className={errors.loan_intent ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Chọn mục đích vay" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DEBT_CONSOLIDATION">Cơ cấu lại nợ</SelectItem>
                                    <SelectItem value="EDUCATION">Giáo dục</SelectItem>
                                    <SelectItem value="HOME_IMPROVEMENT">Cải thiện nhà cửa</SelectItem>
                                    <SelectItem value="MEDICAL">Y tế</SelectItem>
                                    <SelectItem value="PERSONAL">Cá nhân</SelectItem>
                                    <SelectItem value="VENTURE">Đầu tư/Kinh doanh</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.loan_intent && <p className="text-red-500 text-xs">{errors.loan_intent}</p>}
                        </div>
                    </div>
                    {/* loan_grade, loan_int_rate, loan_percent_income thường được tính toán hoặc gợi ý bởi hệ thống,
              nên có thể không cần input trực tiếp từ người dùng ở bước đầu */}
                    {/* Bạn có thể thêm các trường này nếu muốn người dùng tự điền, hoặc để ẩn */}
                    {/* Ví dụ: */}
                    {/* <div className="space-y-2">
            <Label htmlFor="loan_int_rate">Lãi suất mong muốn (%)</Label>
            <Input id="loan_int_rate" type="number" step="0.01" placeholder="Ví dụ: 7.5" value={formData.loan_int_rate} onChange={handleChange} />
          </div> */}

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Đang tạo hồ sơ..." : "Tạo Hồ Sơ Vay Vốn"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}