import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import API from "../api/api";
import "../styles/register.css";

function Register() {
  const inputStyle = "bg-white shadow-2xl outline-none px-4 p-2 rounded-3xl";
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthday, setBirthday] = useState();
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await API.post("/register", {
        username,
        email,
        password,
        birthday,
        phone,
        address,
        gender,
      });

      setMessage("Register successfully!");
      navigate("/login");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (err.response?.data?.error?.code === "ER_DUP_ENTRY") {
        setMessage("Username existed!");
      } else {
        setMessage("Register Error!");
      }
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="w-full flex flex-col justify-center items-center p-5 gap-y-10">
        <div className="flex flex-col justify-center items-center gap-y-2">
          <h1 className="text-4xl font-sm">REGISTER</h1>
          <span className="text-stone-700 text-sm">
            Experience the ultimate platform for managing your products and
            resources efficiently. Seamless, secure, and smart.
          </span>
        </div>
        <form
          onSubmit={handleRegister}
          className="flex flex-col p-9 gap-15 bg-gray-100 w-[80%] rounded-3xl"
        >
          <div className="flex w-full justify-between items-center">
            <div className="flex flex-col w-90 gap-2">
              <label htmlFor="username">
                Username <i class="ri-user-3-fill"></i>
              </label>
              <input
                className={inputStyle}
                type="text"
                placeholder="username"
                name="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="flex flex-col w-90 gap-2">
              <label htmlFor="email">
                Email <i class="ri-mail-fill"></i>
              </label>
              <input
                className={inputStyle}
                type="text"
                placeholder="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col w-90 gap-2">
              <label htmlFor="password">
                password <i class="ri-lock-fill"></i>
              </label>
              <input
                className={inputStyle}
                type="password"
                placeholder="Password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex w-full justify-between items-center">
            <div className="flex flex-col w-90 gap-2">
              <label htmlFor="birthday">
                Birthday <i class="ri-calendar-check-fill"></i>
              </label>
              <input
                className={inputStyle}
                type="date"
                placeholder="Birthday"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
            </div>

            <div className="flex flex-col w-90 gap-2">
              <label htmlFor="phone">
                Phone (Option) <i class="ri-phone-fill"></i>
              </label>
              <input
                className={inputStyle}
                type="number"
                placeholder="Phone Number"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="flex flex-col w-90 gap-2">
              <label htmlFor="address">
                Address (Option) <i class="ri-map-pin-fill"></i>
              </label>
              <input
                className={inputStyle}
                type="text"
                placeholder="Address"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="flex w-full justify-between items-end gap-2">
            <div className="flex flex-col justify-between w-90 gap-2">
              <label htmlFor="gender">
                Gender <i class="ri-genderless-fill"></i>
              </label>
              <select
                name="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="bg-white rounded-2xl py-2"
              >
                <option value="male">
                  Male <i class="ri-men-fill"></i>
                </option>
                <option value="female">
                  female <i class="ri-women-fill"></i>
                </option>
                <option value="noreveal">
                  Don't want to reveal <i class="ri-travesti-fill"></i>
                </option>
              </select>
            </div>

            <div className="flex items-end gap-20 ">
              <div className="flex gap-3">
                <p className="text-gray-700 text-sm">&copy;Copyright</p>
                <p className="text-gray-700 text-sm">@Hasekimagru 2025</p>
              </div>
              <div className="flex gap-5 items-end">
                <NavLink to="/login" className="text-sm text-gray-900 hover:underline">Already have an account? Login in</NavLink>
                <button className="w-40 py-3 bg-black rounded-3xl text-white cursor-pointer hover:opacity-70" type="submit">Sign Up</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default Register;
