import React, { useRef, useState } from 'react'
import { useMachine } from '@xstate/react'
import cn from 'classnames'

import { Round, Word } from '../../../../../shared/types'
import {
  activateRound,
  addWords,
  removeWord as apiRemoveWord,
} from '../../../services/rounds'
import { getLoggedInUser } from '../../../utils/auth'

import {
  EVENTS as TURN_EVENTS,
  Context as TurnMachineContext,
  Events as TurnMachineEvents,
  turnMachine,
} from './machines/turnMachine'
import { useApiRequest } from '../../../hooks/api'
import CTAHeader from '../../reusable/headers/CTAHeader'
import CloseIcon from '../../reusable/icons/CloseIcon'
import Button from '../../reusable/forms/fields/Button'
import Form from '../../reusable/forms/Form'
import Input from '../../reusable/forms/fields/Input'

const RoundHeader = ({ roomId, round }: { roomId: string; round: Round }) => {
  const userName = getLoggedInUser()

  const { makeApiRequest: startGame } = useApiRequest({
    apiFn: async () => {
      return activateRound({ roomId })
    },
    id: 'start-game',
  })

  const isLeader = round.leader === userName
  let headerContent = <CTAHeader>Waiting for {round.leader}...</CTAHeader>
  const leaderActions = (
    <div className="round-header-actions">
      <Button onClick={startGame}>Start My Turn</Button>
    </div>
  )

  if (round.state === 'new') {
    headerContent = (
      <>
        <AddWords
          roomId={roomId}
          submittedWords={round.words.filter(
            ({ createdBy }) => createdBy === userName
          )}
        />
        {isLeader && leaderActions}
      </>
    )
  } else if (isLeader) {
    if (round.state === 'pending') {
      headerContent = leaderActions
    } else {
      headerContent = <Leader roomId={roomId} words={round.words} />
    }
  } else if (round.state === 'active') {
    headerContent = <CTAHeader>{round.leader} is up!</CTAHeader>
  }

  return headerContent
}

const AddWords = ({
  roomId,
  submittedWords,
}: {
  roomId: string
  submittedWords: Word[]
}) => {
  const wordToRemove = useRef('')
  const [words, setWords] = useState('')

  const { makeApiRequest: submitCelebrity } = useApiRequest({
    apiFn: async () => {
      const addWordsResult = await addWords({ roomId, words })
      setWords('')

      return addWordsResult
    },
    id: 'add-words',
  })

  const { makeApiRequest: removeWord } = useApiRequest({
    apiFn: async () => {
      return apiRemoveWord({ roomId, word: wordToRemove.current })
    },
    id: 'remove-word',
  })

  return (
    <div className="add-words">
      <CTAHeader>Add Your Words!</CTAHeader>
      {submittedWords.length > 0 && (
        <div className="add-words-submitted-words">
          {submittedWords.map(({ word }) => {
            return (
              <div key={word} className="add-words-submitted-word">
                <span>{word}</span>
                <div
                  className="add-words-submitted-word-remove"
                  onClick={() => {
                    wordToRemove.current = word
                    removeWord()
                  }}
                >
                  <CloseIcon />
                </div>
              </div>
            )
          })}
        </div>
      )}
      <Form>
        <Input
          name="words"
          onChange={setWords}
          placeholder="(e.g. Brad Pitt, Angelina Jolie)"
          value={words}
        />
        <Button onClick={submitCelebrity} type="submit">
          Add
        </Button>
      </Form>
    </div>
  )
}

const Leader = ({ roomId, words }: { roomId: string; words: Word[] }) => {
  const [turnState, turnSend] = useMachine<
    TurnMachineContext,
    TurnMachineEvents
  >(
    turnMachine.withContext({
      ...(turnMachine.context as TurnMachineContext),
      availableWords: words.filter(({ claimedBy }) => !claimedBy),
      roomId,
    }),
    {
      devTools: true,
    }
  )
  const { availableWords, secondsLeft, totalSeconds } = turnState.context
  const dashArray = 290
  const dashOffset = (secondsLeft / totalSeconds) * dashArray * -1
  const currentWord = availableWords[0]?.word

  return (
    <div className="leader">
      <svg
        className={cn('clock', { 'clock-low': secondsLeft <= 25 })}
        viewBox="0 0 100 100"
      >
        <path
          className="clock-outline"
          d="M 50,4 a 46,46 0 1,0 0,92 a 46,46 0 1,0 0,-92"
        />
        <path
          className="clock-seconds-left"
          d="M 50,4 a 46,46 0 1,0 0,92 a 46,46 0 1,0 0,-92"
          style={{
            strokeDasharray: dashArray,
            strokeDashoffset: dashOffset,
          }}
        />
        <text dominantBaseline="middle" textAnchor="middle" x="50%" y="50%">
          {secondsLeft}
        </text>
      </svg>
      <button
        onClick={() => {
          turnSend({ type: TURN_EVENTS.END_TURN })
        }}
      >
        End
      </button>
      <CTAHeader>You're Up!</CTAHeader>
      <div className="current-word">{currentWord}</div>
      <div className="leader-actions">
        <Button
          onClick={() => {
            turnSend({ type: TURN_EVENTS.CLAIM_WORD, wordToClaim: currentWord })
          }}
        >
          Got It!
        </Button>
        <Button
          isMuted={true}
          onClick={() => {
            turnSend({ type: TURN_EVENTS.SKIP_WORD })
          }}
        >
          Skip
        </Button>
      </div>
    </div>
  )
}

export default RoundHeader
