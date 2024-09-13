'use client'
import React, { useState } from 'react'
import data from './data'
import Faq_questions from './faq_heading'
//import GeneralQuestions from './general_questions'

import { BackButton } from '../../Button'
import VideoAccordion from './Video'

const Faq = () => {
    const [questions, setQuestions] = useState(data)

    return (
        <div className="container pb-5 Faq_card relative fetch-container my-5">
            <div>
                <BackButton defaultRoute="/" className="back_button" />
                <h1>frequently asked questions</h1>
            </div>
            {questions.map(question => (
                <Faq_questions key={question.id} {...question} />
            ))}
            {/**<GeneralQuestions></GeneralQuestions>*/}
            {/* <VideoAccordion title="Add / withdraw liquidity (video tutorial)" src="https://shib.mypinata.cloud/ipfs/QmVBSzCaf1ZMZKSu1Md8AtLUHuT8qXTtGGuofekp1kJcnn" poster="https://shib.mypinata.cloud/ipfs/QmdcrKw5DQBBTCKMut5MZsu2A1zXQaNiqg38m24j6hFkSJ" /> */}

            {/* <VideoAccordion title="How to add a token on shibaswap (video tutorial)" src="https://shib.mypinata.cloud/ipfs/QmXND9gGhyERpmB4LVQyq6Ko4oCnCpYTSps97fh313wmYb" poster="https://shib.mypinata.cloud/ipfs/QmeQXYsYxgAB8ysSMVFRBHPX6f96D3oPBYxaadRsz36BnJ" /> */}
        </div>
    )
}

export default Faq
