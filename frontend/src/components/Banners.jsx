import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import '../styles/Banner.css';
function Banners() {
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
                <SwiperSlide>
                    <img src="/images/banner1.jpg" alt="Banner 1" className='banner1'/>
                </SwiperSlide>
                <SwiperSlide>
                    <img src="/images/banner2.webp" alt="Banner 2" className='banner2'/>
                </SwiperSlide>
            </Swiper>
            <div className="absolute top-5 z-10 flex justify-center items-center w-full">
                <input type="text" name="" id="search" placeholder='Search for...' className=' bg-white w-150 rounded-[20px] px-3 py-2 outline-0' />
            </div>
        </div>
    );
}

export default Banners;