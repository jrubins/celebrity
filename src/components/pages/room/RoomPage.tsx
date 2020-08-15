import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import _ from 'lodash'
import Cookies from 'js-cookie'
import cn from 'classnames'

import { REALTIME_EVENTS } from '../../../utils/realtime'
import { TeamMemberConnection } from '../../../utils/types'
import { getRoom } from '../../../services/rooms'
import { usePresence, useRealtimeEvents } from '../../../utils/realtime/client'

import { useApiRequest } from '../../../hooks/api'
import Page from '../../reusable/layouts/Page'
import RoundHeader from './RoundHeader'
import Team from './Team'

const ROUND_NAMES = ['...', 'Charades', 'One Word']

const RoomPage = () => {
  const userName = Cookies.get('celebrity-user-name')
  const { id: roomId } = useParams()
  const [memberConnections, setMemberConnections] = useState<
    TeamMemberConnection[]
  >([])

  const { data: getRoomResult, makeApiRequest: refetchRoom } = useApiRequest({
    apiFn: async () => {
      return getRoom({ roomId })
    },
    id: 'get-room',
    onMount: true,
  })
  const room = getRoomResult ? getRoomResult.data : null
  const { rounds = [], teamA = [], teamB = [] } = room || {}
  const round = rounds.find(({ state }) => state !== 'completed') || null
  let teamAPoints = 0
  let teamBPoints = 0
  const teamANames = teamA.map(({ name }) => name)
  rounds.forEach(({ words }) => {
    words.forEach((word) => {
      if (!word.claimedBy) {
        return
      }

      if (teamANames.includes(word.claimedBy)) {
        teamAPoints = teamAPoints + 1
      } else {
        teamBPoints = teamBPoints + 1
      }
    })
  })

  usePresence({
    channel: roomId,
    onConnected: (people) => {
      setMemberConnections(_.map(people.members))
    },
    onPersonJoined: (newMember) => {
      refetchRoom()
      setMemberConnections((members) => {
        return _.uniqBy([...members, newMember.info], 'name')
      })
    },
    onPersonLeft: (member) => {
      setMemberConnections((members) => {
        return _.reject(members, { name: member.info.name })
      })
    },
  })

  useRealtimeEvents({
    channel: roomId,
    callbacks: {
      [REALTIME_EVENTS.GAME_STARTED]: refetchRoom,
      [REALTIME_EVENTS.ROUND_STARTED]: refetchRoom,
      [REALTIME_EVENTS.TURN_ENDED]: refetchRoom,
      [REALTIME_EVENTS.WORD_CLAIMED]: refetchRoom,
      [REALTIME_EVENTS.WORD_REMOVED]: refetchRoom,
      [REALTIME_EVENTS.WORDS_ADDED]: refetchRoom,
    },
  })

  return (
    <Page
      sidebarContent={
        <>
          <div className="room-page-sidebar-description">
            <p>Welcome to Celebrity! The game that keeps on giving.</p>
            <div className="room-page-sidebar-rounds">
              {ROUND_NAMES.map((roundName, i) => {
                const isRoundActive = rounds.length - 1 === i

                return (
                  <div
                    key={roundName}
                    className={cn('room-page-sidebar-round', {
                      'room-page-sidebar-round-active': isRoundActive,
                    })}
                  >
                    Round {i + 1}: {roundName}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="room-page-sidebar-user">Logged in as: {userName}</div>
        </>
      }
    >
      {round && (
        <div className="room-page">
          <RoundHeader roomId={roomId} round={round} />
          <div className="teams">
            <Team
              connections={memberConnections}
              members={teamA}
              name="Team A"
              points={teamAPoints}
              round={round}
            />
            <Team
              connections={memberConnections}
              members={teamB}
              name="Team B"
              points={teamBPoints}
              round={round}
            />
          </div>
        </div>
      )}
    </Page>
  )
}

export default RoomPage
