export default async (req) => {
    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const { name, email, subject, message } = await req.json();

        if (!name || !email || !message) {
            return new Response(JSON.stringify({ error: "جميع الحقول مطلوبة" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // هنا يمكن إرسال إيميل أو حفظ في قاعدة بيانات
        console.log("New contact message:", { name, email, subject, message });

        return new Response(JSON.stringify({
            success: true,
            message: "تم استلام رسالتك بنجاح"
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Contact form error:", error);
        
        return new Response(JSON.stringify({ 
            error: "فشل في إرسال الرسالة" 
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};

export const config = {
    path: "/api/contact"
};
