import Image from 'next/image'
import React, { useState } from 'react'

const VideoAccordion = ({  title, src, poster }: any) => {
  const [expand, setExpand] = useState<boolean>(false)
  return (
    <div className="row">
      <div className="col">
        <div className="tabs">
          <div className="tab">
            <div className="tab-label" onClick={() => setExpand(!expand)}>{title}
                <div>
                {expand ? <Image alt='Down icon' height={20} width={20} src={'/images/home/down-arrow.png'} /> 
                : <Image alt='Up icon' height={20} width={20} src={'/images/home/next.png'} />}
                </div>
            </div>
            <div>
              {expand && (
                <div className="tab-content">
                  <div className="mp4Cover" id="video-tuts-3">
                    <video
                      className='mx-auto max-w-full min-w-[340px] rounded-xl'
                      controls
                      poster={poster}
                      src={src}
                    >
                      Sorry, your browser doesn&apos;t support embedded videos, but don&apos;t worry, you can
                      <a
                        href={src}
                      >
                        download it
                      </a>
                      and watch it with your favorite video player!
                    </video>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoAccordion
