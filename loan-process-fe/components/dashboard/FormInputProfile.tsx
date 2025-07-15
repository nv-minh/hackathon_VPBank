"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

const homeOwnershipOptions = [
    { value: 'RENT', label: 'Thuê' },
    { value: 'OWN', label: 'Sở hữu' },
    { value: 'MORTGAGE', label: 'Đang thế chấp' },
    { value: 'OTHER', label: 'Khác' },
];

const loanIntentOptions = [
    { value: 'DEBT_CONSOLIDATION', label: 'Cơ cấu lại nợ' },
    { value: 'EDUCATION', label: 'Giáo dục' },
    { value: 'HOME_IMPROVEMENT', label: 'Cải thiện nhà cửa' },
    { value: 'MEDICAL', label: 'Y tế' },
    { value: 'PERSONAL', label: 'Cá nhân' },
    { value: 'VENTURE', label: 'Đầu tư/Kinh doanh' },
];

const defaultOnFileOptions = [
    { value: 'yes', label: 'Có' },
    { value: 'no', label: 'Không' },
];

interface FormInputProfileProps {
    onProfileCreated: (profileId: string) => void;
}

export function FormInputProfile({ onProfileCreated }: FormInputProfileProps) {

    const [formData, setFormData] = useState({
        person_age: '',
        person_income: '',
        person_home_ownership: '',
        person_emp_length: '',
        loan_intent: '',
        loan_amnt: '',
        loan_int_rate: '',
        cb_person_default_on_file: '',
        cb_person_cred_hist_length: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        if (errors[id]) {
            setErrors(prev => ({ ...prev, [id]: '' }));
        }
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        const numericValue = value.replace(/[^0-9]/g, ''); // Chỉ giữ lại số
        setFormData(prev => ({ ...prev, [id]: numericValue }));
        if (errors[id]) {
            setErrors(prev => ({ ...prev, [id]: '' }));
        }
    };

    const handleSelectChange = (id: string, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
        if (errors[id]) {
            setErrors(prev => ({ ...prev, [id]: '' }));
        }
    };

    const formatCurrency = (value: string) => {
        if (!value) return "";
        return new Intl.NumberFormat('vi-VN').format(Number(value));
    };

    const validateForm = () => {
        let newErrors: Record<string, string> = {};
        if (!formData.person_age || parseInt(formData.person_age) <= 0) newErrors.person_age = "Vui lòng nhập tuổi hợp lệ.";
        if (!formData.person_income || parseFloat(formData.person_income) <= 0) newErrors.person_income = "Vui lòng nhập thu nhập hợp lệ.";
        if (!formData.person_home_ownership) newErrors.person_home_ownership = "Vui lòng chọn tình trạng nhà ở.";
        if (!formData.person_emp_length || parseFloat(formData.person_emp_length) < 0) newErrors.person_emp_length = "Vui lòng nhập số năm làm việc hợp lệ.";
        if (!formData.loan_intent) newErrors.loan_intent = "Vui lòng chọn mục đích vay.";
        if (!formData.loan_amnt || parseFloat(formData.loan_amnt) <= 0) newErrors.loan_amnt = "Vui lòng nhập số tiền vay hợp lệ.";
        if (!formData.loan_int_rate || parseFloat(formData.loan_int_rate) <= 0) newErrors.loan_int_rate = "Vui lòng nhập lãi suất mong muốn hợp lệ.";
        if (!formData.cb_person_default_on_file) newErrors.cb_person_default_on_file = "Vui lòng xác nhận lịch sử nợ quá hạn.";
        if (!formData.cb_person_cred_hist_length || parseInt(formData.cb_person_cred_hist_length) < 0) newErrors.cb_person_cred_hist_length = "Vui lòng nhập lịch sử tín dụng hợp lệ.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Lỗi nhập liệu", { description: "Vui lòng kiểm tra lại các trường thông tin." });
            return;
        }

        setIsSubmitting(true);
        const payload = {
            age: parseInt(formData.person_age),
            income: parseFloat(formData.person_income),
            home_ownership: formData.person_home_ownership,
            employment_length_years: parseFloat(formData.person_emp_length),
            loan_intent: formData.loan_intent,
            loan_amount: parseFloat(formData.loan_amnt),
            interest_rate: parseFloat(formData.loan_int_rate),
            default_on_file: formData.cb_person_default_on_file === 'yes' ? 'Y' : 'N',
            credit_history_length_years: parseInt(formData.cb_person_cred_hist_length),
        };

        try {
            const response = await fetch('/api/create-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (response.ok) {
                toast.success("Thành công!", { description: "Hồ sơ vay vốn của bạn đã được tạo." });
                onProfileCreated(data.profileId);
            } else {
                toast.error("Lỗi", { description: `Không thể tạo hồ sơ: ${data.message || 'Lỗi không xác định'}` });
            }
        } catch (error) {
            console.error("Error submitting profile:", error);
            toast.error("Lỗi kết nối", { description: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-bold text-red-600 mb-2">Bạn chưa có hồ sơ vay vốn!</CardTitle>
                <CardDescription className="text-gray-700">
                    Vui lòng điền thông tin dưới đây để tạo hồ sơ và bắt đầu đăng ký khoản vay.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6"> {/* Tăng khoảng cách để form thoáng hơn */}
                    <div>
                        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Thông tin cá nhân</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="person_age">Tuổi</Label>
                                <Input id="person_age" type="number" placeholder="Ví dụ: 25" value={formData.person_age} onChange={handleChange} className={errors.person_age ? "border-red-500" : ""} />
                                {errors.person_age && <p className="text-red-500 text-sm">{errors.person_age}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="person_income">Thu nhập hàng năm (VNĐ)</Label>
                                <Input id="person_income" type="text" placeholder="Ví dụ: 120.000.000" value={formatCurrency(formData.person_income)} onChange={handleCurrencyChange} className={errors.person_income ? "border-red-500" : ""} />
                                {errors.person_income && <p className="text-red-500 text-sm">{errors.person_income}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="person_home_ownership">Tình trạng nhà ở</Label>
                                <Select onValueChange={(val) => handleSelectChange('person_home_ownership', val)} value={formData.person_home_ownership}>
                                    <SelectTrigger className={errors.person_home_ownership ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Chọn tình trạng nhà ở" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {homeOwnershipOptions.map(option => (
                                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.person_home_ownership && <p className="text-red-500 text-sm">{errors.person_home_ownership}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="person_emp_length">Số năm làm việc</Label>
                                <Input id="person_emp_length" type="number" step="0.5" placeholder="Ví dụ: 5.5" value={formData.person_emp_length} onChange={handleChange} className={errors.person_emp_length ? "border-red-500" : ""} />
                                {errors.person_emp_length && <p className="text-red-500 text-sm">{errors.person_emp_length}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cb_person_default_on_file">Từng có nợ quá hạn?</Label>
                                <Select onValueChange={(val) => handleSelectChange('cb_person_default_on_file', val)} value={formData.cb_person_default_on_file}>
                                    <SelectTrigger className={errors.cb_person_default_on_file ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Chọn" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {defaultOnFileOptions.map(option => (
                                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.cb_person_default_on_file && <p className="text-red-500 text-sm">{errors.cb_person_default_on_file}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cb_person_cred_hist_length">Lịch sử tín dụng (số năm)</Label>
                                <Input id="cb_person_cred_hist_length" type="number" placeholder="Ví dụ: 3" value={formData.cb_person_cred_hist_length} onChange={handleChange} className={errors.cb_person_cred_hist_length ? "border-red-500" : ""} />
                                {errors.cb_person_cred_hist_length && <p className="text-red-500 text-sm">{errors.cb_person_cred_hist_length}</p>}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Thông tin khoản vay mong muốn</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="loan_amnt">Số tiền muốn vay (VNĐ)</Label>
                                <Input id="loan_amnt" type="text" placeholder="Ví dụ: 50.000.000" value={formatCurrency(formData.loan_amnt)} onChange={handleCurrencyChange} className={errors.loan_amnt ? "border-red-500" : ""} />
                                {errors.loan_amnt && <p className="text-red-500 text-sm">{errors.loan_amnt}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="loan_intent">Mục đích vay</Label>
                                <Select onValueChange={(val) => handleSelectChange('loan_intent', val)} value={formData.loan_intent}>
                                    <SelectTrigger className={errors.loan_intent ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Chọn mục đích vay" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loanIntentOptions.map(option => (
                                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.loan_intent && <p className="text-red-500 text-sm">{errors.loan_intent}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="loan_int_rate">Lãi suất mong muốn (%/năm)</Label>
                                <Input id="loan_int_rate" type="number" step="0.1" placeholder="Ví dụ: 12.5" value={formData.loan_int_rate} onChange={handleChange} className={errors.loan_int_rate ? "border-red-500" : ""} />
                                {errors.loan_int_rate && <p className="text-red-500 text-sm">{errors.loan_int_rate}</p>}
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full !mt-8" disabled={isSubmitting}>
                        {isSubmitting ? "Đang tạo hồ sơ..." : "Tạo Hồ Sơ Vay Vốn"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}