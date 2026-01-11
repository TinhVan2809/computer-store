import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import '../styles/Banner.css';
function Banners() {
    const [banners, setBanners] = useState([]);
    const API_BANNER = 'http://localhost/computer-store/backend/banners/banner_api_endpoint.php';
    const IMAGE_URL = 'http://localhost/computer-store/backend/uploads/banners/';

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await fetch(`${API_BANNER}?action=get`);
                const data = await response.json();
                if (data.success) {
                    setBanners(data.data);
                }
            } catch (error) {
                console.error("Error fetching banners:", error);
            }
        };
        fetchBanners();
    }, []);

    return (
        <div className="banner-container relative">
            {/*className = 'swiper-container'*/}
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={50}
                slidesPerView={1}
                loop={true}
                autoplay={{ delay: 10000 }}
            >
                {/*className = 'swiper-silde'*/}
                {banners.length > 0 ? banners.map((banner) => (
                    <SwiperSlide key={banner.banner_id}>
                        <img src={`${IMAGE_URL}${banner.image}`} alt={`Banner ${banner.banner_id}`} className='w-full h-full object-cover'/>
                    </SwiperSlide>
                )) : (
                    <SwiperSlide><div className="w-full h-[300px] bg-gray-200 flex items-center justify-center">Loading banners...</div></SwiperSlide>
                )}
            </Swiper>
            <div className="absolute top-5 z-10 flex justify-center items-center w-full">
                <input type="text" name="" id="search" placeholder='Search for...' className=' bg-white w-150 rounded-[20px] px-3 py-2 outline-0' />
            </div>
        </div>
    );
}

export default Banners;