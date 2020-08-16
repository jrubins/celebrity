import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'

import { APIResponse } from '../../../utils/types'
import { Room } from '../../../../../shared/types'
import { createRoom, joinRoom as apiJoinRoom } from '../../../services/rooms'
import { storeName } from '../../../utils/auth'

import { useApiRequest } from '../../../hooks/api'
import Button from '../../reusable/forms/fields/Button'
import CTAHeader from '../../reusable/headers/CTAHeader'
import Form from '../../reusable/forms/Form'
import FormContent from '../../reusable/forms/FormContent'
import FormGroup from '../../reusable/forms/FormGroup'
import Input from '../../reusable/forms/fields/Input'

const JoinRoomPage = ({ isCreation = false }: { isCreation?: boolean }) => {
  const history = useHistory()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [roomName, setRoomName] = useState('')

  const { makeApiRequest: joinRoom } = useApiRequest({
    apiFn: async () => {
      let joinRoomResponse: APIResponse<Room>
      if (isCreation) {
        joinRoomResponse = await createRoom({ name, password, roomName })
      } else {
        joinRoomResponse = await apiJoinRoom({ name, password, roomName })
      }

      const roomId = joinRoomResponse.data.id
      storeName(name)
      history.push(`/room/${roomId}`)

      return joinRoomResponse
    },
    id: 'join-room',
  })

  return (
    <div className="join-room-page">
      <CTAHeader>{isCreation ? 'Create' : 'Join'} A Room</CTAHeader>
      <Form>
        <FormContent>
          <FormGroup label="Your Name:" labelFor="name">
            <Input name="name" onChange={setName} value={name} />
          </FormGroup>
          <FormGroup label="Room Name:" labelFor="room-name">
            <Input name="room-name" onChange={setRoomName} value={roomName} />
          </FormGroup>
          <FormGroup label="Password:" labelFor="room-password">
            <Input
              name="room-password"
              onChange={setPassword}
              value={password}
            />
          </FormGroup>
          <Button onClick={joinRoom} type="submit">
            {isCreation ? 'Create' : 'Join'}
          </Button>
        </FormContent>
      </Form>
    </div>
  )
}

export default JoinRoomPage
