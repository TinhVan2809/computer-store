import '../styles/footer.css';
export default function Footer() {
    return (
      <>
        <footer className="footer-container w-full flex flex-col bg-white shadow-2xl gap-[75px]">
          <div className="footer-header flex justify-between items-start w-full">
            <section className="flex flex-col gap-3">
                <h2 className="text-2xl text-black font-bold">AWAY-STORE</h2>
                <span className="text-sm text-gray-700 ">We alway help your computer get stronger.</span>
            </section>
            <nav className="flex gap-30">
                <ul className="flex flex-col gap-2">
                    <li className="text-[14px] text-[#61616f] font-medium hover:underline cursor-pointer underline-offset-2">Products</li>
                    <li className="text-[14px] text-[#61616f] font-medium hover:underline cursor-pointer underline-offset-2">Features</li>
                    <li className="text-[14px] text-[#61616f] font-medium hover:underline cursor-pointer underline-offset-2">Contact</li>
                    <li className="text-[14px] text-[#61616f] font-medium hover:underline cursor-pointer underline-offset-2">Pricing</li>
                    <li className="text-[14px] text-[#61616f] font-medium hover:underline cursor-pointer underline-offset-2">Blog</li>
                </ul>
                <ul className="flex flex-col gap-2">
                    <li className="text-[14px] text-[#61616f] font-medium hover:underline cursor-pointer underline-offset-2">Documentation</li>
                    <li className="text-[14px] text-[#61616f] font-medium hover:underline cursor-pointer underline-offset-2">FAQ</li>
                    <li className="text-[14px] text-[#61616f] font-medium hover:underline cursor-pointer underline-offset-2">Support</li>
                    <li className="text-[14px] text-[#61616f] font-medium hover:underline cursor-pointer underline-offset-2">About</li>
                </ul>
                <ul className="flex flex-col gap-2">
                    <li className="text-[14px] text-[#61616f] font-medium hover:underline cursor-pointer underline-offset-2"><i className="ri-twitter-x-line"></i> Twitter</li>
                    <li className="text-[14px] text-[#61616f] font-medium hover:underline cursor-pointer underline-offset-2"><i className="ri-facebook-fill"></i> Facebook</li>
                    <li className="text-[14px] text-[#61616f] font-medium hover:underline cursor-pointer underline-offset-2"><i className="ri-youtube-line"></i> Youtube</li>
                    <li className="text-[14px] text-[#61616f] font-medium hover:underline cursor-pointer underline-offset-2"><i className="ri-tiktok-fill"></i> TikTok</li>
                </ul>
            </nav>
          </div>
          <div className="copy-right flex w-full justify-between items-center">
            <button className="border border-stone-300 px-3 py-2 rounded-md text-black font-[550] text-sm cursor-pointer duration-200 hover:bg-black hover:text-white">Learn more my system</button>
            <div className="items flex gap-8">
                <p className="text-sm text-gray-600">&copy;Copyright 2026</p>
                <p className="text-sm text-gray-600">Privacy poily</p>
                <p className="text-sm text-gray-600">Cookie setting</p> 
            </div>
          </div>
        </footer>
      </>
    );
}