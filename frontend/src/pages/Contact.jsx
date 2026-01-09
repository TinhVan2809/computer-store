import UserContext from "../context/UserContext";
import { useContext } from "react";

// Chứa thông tin liên lạc
// Câu hỏi thường gặp
function Contact() {
    const { currentUser } = useContext(UserContext);
    const user_id = currentUser?.id;
    
    return (
        <>

        </>
    );
}

export default Contact;