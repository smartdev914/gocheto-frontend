import React from 'react'

const QuestionLogo = () => {
  return (
    <div className="rounded" style={{ maxWidth: 32, maxHeight: 32 }}>
      <div style={{ width: 32, height: 32 }} className="questions flex items-center justify-center">
        <span className={'text-xl'}>?</span>
      </div>
    </div>
  )
}

export default QuestionLogo
