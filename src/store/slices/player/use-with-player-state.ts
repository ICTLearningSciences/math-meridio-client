/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { v4 as uuid } from 'uuid';
import { Avatar, clearPlayer, fetchPlayer, savePlayer } from '.';
import { jsonLlmRequest } from '../../../classes/game-state/api-helpers';
import { OpenAiServiceModel } from '../../../classes/game-state/types';
import {
  GenericLlmRequest,
  LoadStatus,
  PromptOutputTypes,
  PromptRoles,
} from '../../../types';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { Schema } from 'jsonschema';
import { arrayNRandom } from '../../../helpers';

export const pickAvatarSchema: Schema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      type: { type: 'string' },
      id: { type: 'string' },
      description: { type: 'string' },
    },
  },
  required: ['id', 'type', 'description'],
};

export interface Avatars {
  avatar: Avatar[];
  chatAvatar: Avatar[];
}

export function useWithPlayer() {
  const dispatch = useAppDispatch();
  const { player, loadStatus, saveStatus } = useAppSelector(
    (state) => state.playerData
  );

  React.useEffect(() => {
    if (loadStatus.status === LoadStatus.NONE) {
      if (player) {
        dispatch(fetchPlayer(player.clientId));
      } else {
        dispatch(clearPlayer());
      }
    } else if (loadStatus.status === LoadStatus.FAILED) {
      dispatch(clearPlayer());
    }
  }, [loadStatus]);

  function createPlayerName(name: string): void {
    dispatch(
      savePlayer({
        clientId: uuid(),
        name: name,
        avatar: [],
        chatAvatar: [],
        description: '',
      })
    );
  }

  function saveAvatar(
    description: string,
    avatar: Avatar[],
    chatAvatar: Avatar[]
  ): void {
    if (!player) return;
    dispatch(
      savePlayer({
        clientId: player.clientId,
        name: player.name,
        avatar: avatar,
        chatAvatar: chatAvatar,
        description: description,
      })
    );
  }

  async function loadAvatarsFromDesc(
    desc: string
  ): Promise<{ message: string; avatars: Avatars[] }> {
    try {
      const avatars: Avatars[] = [];
      let message = 'Select an avatar or try describing your avatar again:';
      let heads = await requestAvatarItems(desc, CHAT_AVATAR_HEADS);
      let eyes = await requestAvatarItems(desc, CHAT_AVATAR_EYES);
      if (heads.length === 0) {
        message =
          'Not enough results. Describe avatar again or use a random one:';
        heads = arrayNRandom(CHAT_AVATAR_HEADS, NUM_AVATARS_TO_SPAWN);
      }
      if (eyes.length === 0) {
        message =
          'Not enough results. Describe avatar again or use a random ones';
        eyes = arrayNRandom(CHAT_AVATAR_EYES, NUM_AVATARS_TO_SPAWN);
      }

      const s_body = arrayNRandom(SPRITE_BODY, NUM_AVATARS_TO_SPAWN);
      const s_hair = arrayNRandom(SPRITE_HAIR, NUM_AVATARS_TO_SPAWN);
      const s_clothes = arrayNRandom(SPRITE_CLOTHES, NUM_AVATARS_TO_SPAWN);
      const s_acc = arrayNRandom(SPRITE_ACCESSORY, NUM_AVATARS_TO_SPAWN);

      for (let i = 0; i < NUM_AVATARS_TO_SPAWN; i++) {
        const head = heads[i % heads.length];
        const eye = eyes[i % eyes.length];
        const desc = head.description.toLowerCase();
        const brow = desc.includes('black hair')
          ? CHAT_AVATAR_BROWS[0]
          : desc.includes('blonde hair')
          ? CHAT_AVATAR_BROWS[1]
          : CHAT_AVATAR_BROWS[2];
        const nose = desc.includes('white skin')
          ? CHAT_AVATAR_NOSE[0]
          : CHAT_AVATAR_NOSE[1];
        const mouth = desc.includes('white skin')
          ? CHAT_AVATAR_MOUTH[0]
          : CHAT_AVATAR_MOUTH[1];
        avatars.push({
          avatar: [s_body[i], s_hair[i], s_clothes[i], s_acc[i]],
          chatAvatar: [head, brow, eye, nose, mouth],
        });
      }

      return {
        message,
        avatars,
      };
    } catch (err) {
      console.error(err);
      return {
        message: 'Something went wrong. Describe your avatar again:',
        avatars: [],
      };
    }
  }

  async function requestAvatarItems(
    desc: string,
    items: Avatar[]
  ): Promise<Avatar[]> {
    try {
      const request: GenericLlmRequest = {
        prompts: [
          {
            promptText: JSON.stringify(items),
            promptRole: PromptRoles.USER,
          },
          {
            promptText: `Based on the following description, choose ${NUM_AVATARS_TO_SPAWN} items to add from the list of items above.`,
            promptRole: PromptRoles.USER,
          },
          {
            promptText: desc,
            promptRole: PromptRoles.USER,
          },
        ],
        targetAiServiceModel: OpenAiServiceModel,
        outputDataType: PromptOutputTypes.JSON,
        responseFormat: `
            Please only respond in JSON.
            Validate that your response is in valid JSON.
            Respond in this format:
              [{
                  "type": "string"        // the type of the item
                  "id": "string"          // the id of the item
                  "description": "string" // the description of the item
              }]
          `,
      };
      const res = await jsonLlmRequest<Avatar[]>(request, pickAvatarSchema);
      return res;
    } catch (err) {
      return [];
    }
  }

  return {
    player,
    loadStatus,
    saveStatus,
    createPlayerName,
    saveAvatar,
    loadAvatarsFromDesc,
  };
}

/** */

export const NUM_AVATARS_TO_SPAWN = 5;

export const CHAT_AVATAR_HEADS: Avatar[] = [
  {
    type: 'head',
    id: 'boy_1',
    description: [
      'Boy',
      'Male',
      'East Asian',
      'Asian',
      'Chinese',
      'Japanese',
      'Korean',
      'White skin',
      'Black hair',
      'Short hair',
      'Bob cut',
      'Bowl cut',
      'Bangs',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'boy_2',
    description: [
      'Boy',
      'Male',
      'White',
      'Caucasian',
      'East Asian',
      'Asian',
      'White skin',
      'Brown hair',
      'Short hair',
      'Side part',
      'Side bangs',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'boy_3',
    description: [
      'Boy',
      'Male',
      'East Asian',
      'Asian',
      'Chinese',
      'Japanese',
      'Korean',
      'White skin',
      'Black hair',
      'Short hair',
      'Bangs',
      'Mop top',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'boy_4',
    description: [
      'Boy',
      'Male',
      'White',
      'Caucasian',
      'East Asian',
      'Asian',
      'White skin',
      'Brown hair',
      'Short hair',
      'Curly hair',
      'Forehead',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'boy_5',
    description: [
      'Boy',
      'Male',
      'East Asian',
      'Asian',
      'Chinese',
      'Japanese',
      'Korean',
      'White skin',
      'Black hair',
      'Short hair',
      'Side part',
      'Side bangs',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'boy_6',
    description: [
      'Boy',
      'Male',
      'East Asian',
      'Asian',
      'Chinese',
      'Japanese',
      'Korean',
      'White skin',
      'Black hair',
      'Short hair',
      'Crew cut',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'boy_7',
    description: [
      'Boy',
      'Male',
      'East Asian',
      'Asian',
      'White skin',
      'Blue hair',
      'Dyed hair',
      'Kpop',
      'Short hair',
      'Styled hair',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'boy_8',
    description: [
      'Boy',
      'Male',
      'White',
      'Caucasian',
      'Hispanic',
      'White skin',
      'Light brown hair',
      'Medium hair',
      'Forehead',
      'Neck-length hair',
      'Mullet',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'boy_9',
    description: [
      'Boy',
      'Male',
      'White',
      'Caucasian',
      'White skin',
      'Light brown hair',
      'Dirty blonde hair',
      'Short hair',
      'Curly hair',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'boy_10',
    description: [
      'Boy',
      'Male',
      'White',
      'Caucasian',
      'White skin',
      'Light blonde hair',
      'Platinum blonde hair',
      'Short hair',
      'Forehead',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'boy_11',
    description: [
      'Boy',
      'Male',
      'White',
      'Caucasian',
      'White skin',
      'Brown hair',
      'Short hair',
      'Slicked back hair',
      'Grease',
      'Forehead',
      'Hair gel',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'boy_12',
    description: [
      'Boy',
      'Male',
      'Black',
      'African American',
      'POC',
      'Black skin',
      'Brown skin',
      'Black hair',
      'Dark brown hair',
      'Short hair',
      'Shaved',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'boy_13',
    description: [
      'Boy',
      'Male',
      'Black',
      'African American',
      'POC',
      'Black skin',
      'Brown skin',
      'Black hair',
      'Dark brown hair',
      'Curls',
      'Afro',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'boy_14',
    description: [
      'Boy',
      'Male',
      'Black',
      'African American',
      'POC',
      'Black skin',
      'Brown skin',
      'Black hair',
      'Dark brown hair',
      'Cornrows',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'boy_15',
    description: [
      'Boy',
      'Male',
      'Black',
      'African American',
      'POC',
      'Black skin',
      'Brown skin',
      'Black hair',
      'Dark brown hair',
      'Afro',
      'Knots',
      'Locs',
      'Dreadlocks',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'boy_16',
    description: [
      'Boy',
      'Male',
      'Black',
      'African American',
      'POC',
      'South asian',
      'Black skin',
      'Brown skin',
      'Black hair',
      'Dark brown hair',
      'Curls',
      'Short hair',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'boy_17',
    description: [
      'Boy',
      'Male',
      'Black',
      'African American',
      'POC',
      'Black skin',
      'Brown skin',
      'Black hair',
      'Dark brown hair',
      'Dreadlocks',
      'Locs',
      'Long hair',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'boy_18',
    description: [
      'Boy',
      'Male',
      'Black',
      'South asian',
      'POC',
      'Blasian',
      'Indian',
      'Black skin',
      'Brown skin',
      'Black hair',
      'Dark brown hair',
      'Short hair',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'boy_19',
    description: [
      'Boy',
      'Male',
      'Black',
      'South asian',
      'POC',
      'Blasian',
      'Indian',
      'Black skin',
      'Brown skin',
      'Dark brown hair',
      'Short hair',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'boy_20',
    description: [
      'Boy',
      'Male',
      'Black',
      'South asian',
      'POC',
      'Blasian',
      'Indian',
      'Black skin',
      'Brown skin',
      'Black hair',
      'Dark brown hair',
      'Short hair',
      'Slicked back',
      'Hair gel',
      'Grease',
      'Forehead',
    ].join(', '),
  },

  {
    type: 'head',
    id: 'girl_1',
    description: [
      'Girl',
      'Female',
      'East Asian',
      'Asian',
      'Chinese',
      'Japanese',
      'Korean',
      'White skin',
      'Black hair',
      'Long hair',
      'Straight hair',
      'Forehead',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_2',
    description: [
      'Girl',
      'Female',
      'East Asian',
      'Asian',
      'Chinese',
      'Japanese',
      'Korean',
      'White skin',
      'Black hair',
      'Short hair',
      'Bob cut',
      'Forehead',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_3',
    description: [
      'Girl',
      'Female',
      'East Asian',
      'Asian',
      'Chinese',
      'Japanese',
      'Korean',
      'White skin',
      'Black hair',
      'Short hair',
      'Straight hair',
      'Forehead',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_4',
    description: [
      'Girl',
      'Female',
      'East Asian',
      'Asian',
      'Chinese',
      'Japanese',
      'Korean',
      'White skin',
      'Black hair',
      'Long hair',
      'Medium hair',
      'Straight hair',
      'Forehead',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_5',
    description: [
      'Girl',
      'Female',
      'East Asian',
      'Asian',
      'Chinese',
      'Japanese',
      'Korean',
      'White skin',
      'Black hair',
      'Short hair',
      'Straight hair',
      'Bangs',
      'Bowl cut',
      'Bob cut',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_6',
    description: [
      'Girl',
      'Female',
      'East Asian',
      'Asian',
      'Chinese',
      'Japanese',
      'Korean',
      'White skin',
      'Black hair',
      'Short hair',
      'Straight hair',
      'Forehead',
      'Pixie cut',
      'Butch',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_7',
    description: [
      'Girl',
      'Female',
      'Black',
      'African American',
      'POC',
      'South Asian',
      'Black skin',
      'Brown skin',
      'Black hair',
      'Dark brown hair',
      'Ponytail',
      'High ponytail',
      'Forehead',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_8',
    description: [
      'Girl',
      'Female',
      'Black',
      'African American',
      'POC',
      'South Asian',
      'Black skin',
      'Brown skin',
      'Black hair',
      'Dark brown hair',
      'Medium hair',
      'Locs',
      'Dreadlocks',
      'Forehead',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_9',
    description: [
      'Girl',
      'Female',
      'Black',
      'African American',
      'POC',
      'South Asian',
      'Black skin',
      'Brown skin',
      'Black hair',
      'Dark brown hair',
      'Short hair',
      'Dark brown hair',
      'Locs',
      'Dreadlocks',
      'Forehead',
      'Ponytail',
      'High ponytail',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_10',
    description: [
      'Girl',
      'Female',
      'Black',
      'African American',
      'POC',
      'South Asian',
      'Black skin',
      'Brown skin',
      'Black hair',
      'Dark brown hair',
      'Medium hair',
      'Medium hair',
      'Cornrows',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_11',
    description: [
      'Girl',
      'Female',
      'Black',
      'African American',
      'POC',
      'Black skin',
      'Brown skin',
      'Black hair',
      'Dark brown hair',
      'Short hair',
      'Afro',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_12',
    description: [
      'Girl',
      'Female',
      'Black',
      'African American',
      'POC',
      'South asian',
      'Black skin',
      'Brown skin',
      'Black hair',
      'Dark brown hair',
      'Medium hair',
      'Afro',
      'Cornrows',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_13',
    description: [
      'Girl',
      'Female',
      'White',
      'Caucasian',
      'White skin',
      'Light brown hair',
      'Blonde hair',
      'Medium hair',
      'Ponytail',
      'Bun',
      'Highlights',
      'Dyed hair',
      'Forehead',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_14',
    description: [
      'Girl',
      'Female',
      'White',
      'Caucasian',
      'White skin',
      'Brown hair',
      'Long hair',
      'Straight hair',
      'Forehead',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_15',
    description: [
      'Girl',
      'Female',
      'White',
      'Caucasian',
      'White skin',
      'Brown hair',
      'Dark brown hair',
      'Short hair',
      'Buns',
      'Bun',
      'Twin tails',
      'Forehead',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_16',
    description: [
      'Girl',
      'Female',
      'White',
      'Caucasian',
      'White skin',
      'Brown hair',
      'Dark brown hair',
      'Medium hair',
      'Curly hair',
      'Forehead',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_17',
    description: [
      'Girl',
      'Female',
      'White',
      'Caucasian',
      'White skin',
      'Brown hair',
      'Dark brown hair',
      'Short hair',
      'Curly hair',
      'Bob cut',
      'Forehead',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_18',
    description: [
      'Girl',
      'Female',
      'Black',
      'African American',
      'POC',
      'South asian',
      'Indian',
      'Black skin',
      'Brown skin',
      'Black hair',
      'Dark brown hair',
      'Medium hair',
      'Straight hair',
      'Forehead',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_19',
    description: [
      'Girl',
      'Female',
      'Black',
      'African American',
      'POC',
      'South asian',
      'Indian',
      'Black skin',
      'Brown skin',
      'Black hair',
      'Dark brown hair',
      'Short hair',
      'Curly hair',
      'Forehead',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_20',
    description: [
      'Girl',
      'Female',
      'Black',
      'African American',
      'POC',
      'South asian',
      'Indian',
      'Black skin',
      'Brown skin',
      'Black hair',
      'Dark brown hair',
      'Long hair',
      'Straight hair',
      'Forehead',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_21',
    description: [
      'Girl',
      'Female',
      'Black',
      'African American',
      'POC',
      'South asian',
      'Indian',
      'Black skin',
      'Brown skin',
      'Black hair',
      'Dark brown hair',
      'Short hair',
      'Pixie cut',
      'Cornrows',
      'Forehead',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_22',
    description: [
      'Girl',
      'Female',
      'White skin',
      'Pink hair',
      'Strawberry blonde hair',
      'Medium hair',
      'Bobcut',
      'Dyed hair',
      'Forehead',
      'Cat ears',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_23',
    description: [
      'Girl',
      'Female',
      'White skin',
      'Blue hair',
      'Purple hair',
      'Medium hair',
      'Ponytails',
      'Pigtails',
      'Twin tails',
      'Dyed hair',
      'Forehead',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_24',
    description: [
      'Girl',
      'Female',
      'White',
      'Caucasian',
      'Asian',
      'East asian',
      'Chinese',
      'Japanese',
      'Korean',
      'White skin',
      'Blue hair',
      'Purple hair',
      'Long hair',
      'Ponytails',
      'Pigtails',
      'Twin tails',
      'Forehead',
      'Braids',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_25',
    description: [
      'Girl',
      'Female',
      'Asian',
      'East asian',
      'Chinese',
      'Japanese',
      'Korean',
      'White skin',
      'Blue hair',
      'Purple hair',
      'Medium hair',
      'Ponytails',
      'Pigtails',
      'Twin tails',
      'Bangs',
      'Buns',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_26',
    description: [
      'Girl',
      'Female',
      'Asian',
      'East asian',
      'Chinese',
      'Japanese',
      'Korean',
      'White skin',
      'Pink hair',
      'Purple hair',
      'Dyed hair',
      'Long hair',
      'Ponytail',
      'Forehead',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_27',
    description: [
      'Girl',
      'Female',
      'White',
      'Caucasian',
      'White skin',
      'Pink hair',
      'Blonde hair',
      'Purple hair',
      'Strawberry blonde hair',
      'Dyed hair',
      'Long hair',
      'Ponytails',
      'Pigtails',
      'Twin tails',
      'Forehead',
    ].join(', '),
  },
  {
    type: 'head',
    id: 'girl_28',
    description: [
      'Girl',
      'Female',
      'White',
      'Caucasian',
      'White skin',
      'Pink hair',
      'Strawberry blonde hair',
      'Dyed hair',
      'Short hair',
      'Forehead',
      'Pixie cut',
      'Butch',
    ].join(', '),
  },
];

export const CHAT_AVATAR_BROWS: Avatar[] = [
  {
    type: 'eyebrows',
    id: 'brows_1',
    description: [
      'Asian',
      'Chinese',
      'Japanese',
      'Korean',
      'Black hair',
      'Dark hair',
    ].join(', '),
  },
  {
    type: 'eyebrows',
    id: 'brows_2',
    description: [
      'Caucasian',
      'White',
      'European',
      'Light brown hair',
      'Blonde hair',
      'Light hair',
    ].join(', '),
  },
  {
    type: 'eyebrows',
    id: 'brows_3',
    description: [
      'Dark brown hair',
      'Brown hair',
      'Red hair',
      'Purple hair',
    ].join(', '),
  },
];

export const CHAT_AVATAR_EYES: Avatar[] = [
  {
    type: 'eyes',
    id: 'eyes_1',
    description: [
      'Asian',
      'Chinese',
      'Japanese',
      'Korean',
      'White skin',
      'Light skin',
      'Black eyes',
    ].join(', '),
  },
  {
    type: 'eyes',
    id: 'eyes_2',
    description: [
      'Asian',
      'Chinese',
      'Japanese',
      'Korean',
      'White skin',
      'Light skin',
      'Black eyes',
      'Gray eyes',
    ].join(', '),
  },
  {
    type: 'eyes',
    id: 'eyes_3',
    description: [
      'Asian',
      'Chinese',
      'Japanese',
      'Korean',
      'White skin',
      'Light skin',
      'Brown eyes',
      'Dark brown eyes',
      'Red eyes',
      'Girl',
      'Female',
      'Lashes',
    ].join(', '),
  },
  {
    type: 'eyes',
    id: 'eyes_4',
    description: [
      'Caucasian',
      'European',
      'White',
      'White skin',
      'Light skin',
      'Light brown skin',
      'Tan skin',
      'Brown eyes',
    ].join(', '),
  },
  {
    type: 'eyes',
    id: 'eyes_5',
    description: [
      'Caucasian',
      'European',
      'White',
      'White skin',
      'Light skin',
      'Light brown skin',
      'Tan skin',
      'Green eyes',
    ].join(', '),
  },
  {
    type: 'eyes',
    id: 'eyes_6',
    description: [
      'Caucasian',
      'European',
      'White',
      'White skin',
      'Light skin',
      'Light brown skin',
      'Tan skin',
      'Blue eyes',
    ].join(', '),
  },
  {
    type: 'eyes',
    id: 'eyes_7',
    description: [
      'Black',
      'African American',
      'POC',
      'Black skin',
      'Brown skin',
      'Dark skin',
      'Brown eyes',
    ].join(', '),
  },
  {
    type: 'eyes',
    id: 'eyes_8',
    description: [
      'Black',
      'African American',
      'POC',
      'Black skin',
      'Brown skin',
      'Dark skin',
      'Light brown eyes',
      'Green eyes',
      'Amber eyes',
    ].join(', '),
  },
  {
    type: 'eyes',
    id: 'eyes_9',
    description: [
      'Black',
      'African American',
      'POC',
      'Black skin',
      'Brown skin',
      'Dark skin',
      'Black eyes',
      'Dark brown eyes',
      'Girl',
      'Female',
      'Lashes',
    ].join(', '),
  },
  {
    type: 'eyes',
    id: 'eyes_10',
    description: [
      'Caucasian',
      'European',
      'White',
      'White skin',
      'Light skin',
      'Blue eyes',
      'Girl',
      'Female',
      'Lashes',
    ].join(', '),
  },
  {
    type: 'eyes',
    id: 'eyes_11',
    description: [
      'Caucasian',
      'European',
      'White',
      'White skin',
      'Light skin',
      'Green eyes',
      'Amber eyes',
      'Light brown eyes',
      'Girl',
      'Female',
      'Lashes',
    ].join(', '),
  },
];

export const CHAT_AVATAR_NOSE: Avatar[] = [
  {
    type: 'nose',
    id: 'nose_1',
    description: ['White', 'White skin', 'Light skin'].join(', '),
  },
  {
    type: 'nose',
    id: 'nose_2',
    description: [
      'African American',
      'POC',
      'Black',
      'Black skin',
      'Brown skin',
      'Dark skin',
    ].join(', '),
  },
];

export const CHAT_AVATAR_MOUTH: Avatar[] = [
  {
    type: 'mouth',
    id: 'mouth1',
    description: ['White', 'White skin', 'Light skin'].join(', '),
  },
  {
    type: 'mouth',
    id: 'mouth2',
    description: [
      'African American',
      'POC',
      'Black',
      'Black skin',
      'Brown skin',
      'Dark skin',
    ].join(', '),
  },
];

/** */

export const SPRITE_BODY: Avatar[] = [
  {
    type: 'sprite',
    id: 'char1',
    description: [
      'Caucasian',
      'European',
      'White',
      'White skin',
      'Pale',
      'Light skin',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'char2',
    description: [
      'Caucasian',
      'European',
      'White',
      'White skin',
      'Pale',
      'Light skin',
      'Tan',
      'Suntan',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'char3',
    description: [
      'Asian',
      'East asian',
      'White',
      'White skin',
      'Pale',
      'Light skin',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'char4',
    description: [
      'Asian',
      'East asian',
      'White',
      'White skin',
      'Pale',
      'Light skin',
      'Tan',
      'Suntan',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'char5',
    description: [
      'South asian',
      'Hispanic',
      'Latino',
      'Indian',
      'Native American',
      'Light brown skin',
      'Brown skin',
      'Red skin',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'char6',
    description: [
      'South asian',
      'Hispanic',
      'Latino',
      'Indian',
      'Native American',
      'Light brown skin',
      'Brown skin',
      'Red skin',
      'Tan',
      'Suntan',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'char7',
    description: [
      'Black',
      'Black skin',
      'Dark skin',
      'Dark brown skin',
      'Brown skin',
      'African American',
      'POC',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'char8',
    description: [
      'Black',
      'Black skin',
      'Dark skin',
      'Dark brown skin',
      'Brown skin',
      'African American',
      'POC',
      'Tan',
      'Suntan',
    ].join(', '),
  },
];

export const SPRITE_HAIR: Avatar[] = [
  {
    type: 'sprite',
    id: 'bob',
    description: ['Bob', 'Short hair', 'Side part', 'Girl', 'Female'].join(
      ', '
    ),
  },
  {
    type: 'sprite',
    id: 'braids',
    description: [
      'Braids',
      'Ponytails',
      'Bangs',
      'Long hair',
      'Girl',
      'Female',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'buzzcut',
    description: [
      'Buzzcut',
      'Shaved',
      'Short hair',
      'Boy',
      'Male',
      'Butch',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'curly',
    description: ['Curly', 'Curls', 'Afro', 'Short hair', 'Boy', 'Male'].join(
      ', '
    ),
  },
  {
    type: 'sprite',
    id: 'emo',
    description: [
      'Emo',
      'Asymmetrical hair cut',
      'Short hair',
      'Boy',
      'Male',
      'Bangs',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'extra_long_skirt',
    description: ['Long hair', 'Straight hair', 'Girl', 'Female', 'Bangs'].join(
      ', '
    ),
  },
  {
    type: 'sprite',
    id: 'extra_long',
    description: ['Long hair', 'Straight hair', 'Girl', 'Female', 'Bangs'].join(
      ', '
    ),
  },
  {
    type: 'sprite',
    id: 'french_curl',
    description: [
      'French curl',
      'Curly hair',
      'Curls',
      'Short hair',
      'Girl',
      'Female',
      'Bangs',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'gentleman',
    description: ['Gentleman', 'Fancy', 'Short hair', 'Boy', 'Male'].join(', '),
  },
  {
    type: 'sprite',
    id: 'long_straight',
    description: ['Long hair', 'Straight hair', 'Girl', 'Female'].join(', '),
  },
  {
    type: 'sprite',
    id: 'long_straight_skirt',
    description: ['Long hair', 'Straight hair', 'Girl', 'Female'].join(', '),
  },
  {
    type: 'sprite',
    id: 'midiwave',
    description: [
      'Medium hair',
      'Wavy hair',
      'Curly hair',
      'Girl',
      'Female',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'ponytail',
    description: ['Medium hair', 'Ponytail', 'Girl', 'Female', 'Bangs'].join(
      ', '
    ),
  },
  {
    type: 'sprite',
    id: 'spacebuns',
    description: [
      'Short hair',
      'Buns',
      'Space buns',
      'Girl',
      'Female',
      'Bangs',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'wavy',
    description: ['Medium hair', 'Wavy hair', 'Girl', 'Female', 'Bangs'].join(
      ', '
    ),
  },
];

export const SPRITE_CLOTHES: Avatar[] = [
  {
    type: 'sprite',
    id: 'basic',
    description: ['T-shirt', 'Shirt', 'Short-sleeved shirt', 'Top'].join(', '),
  },
  {
    type: 'sprite',
    id: 'clown',
    description: [
      'Clown',
      'Joker',
      'Jester',
      'Halloween',
      'Spooky',
      'Scary',
      'Funny',
      'Outfit',
      'Cosplay',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'dress',
    description: [
      'Dress',
      'Gown',
      'Girl',
      'Female',
      'Pretty',
      'Girly',
      'Outfit',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'floral',
    description: [
      'T-shirt',
      'Shirt',
      'Short-sleeved shirt',
      'Flower',
      'Floral',
      'Print shirt',
      'Plant',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'overalls',
    description: [
      'Overalls',
      'Jumper',
      'Work outfit',
      'Pants',
      'Shirt',
      'Outfit',
      'Top',
      'Bottoms',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'pants',
    description: [
      'Pants',
      'Suit',
      'Bottoms',
      'Long pants',
      'Formal',
      'Tuxedo',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'pumpkin',
    description: [
      'Pumpkin',
      'Jack-o-lantern',
      'Halloween',
      'Spooky',
      'Scary',
      'Funny',
      'Outfit',
      'Cosplay',
      'Top',
      'Bottoms',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'sailor_bow',
    description: [
      'Sailor suit',
      'Shirt',
      'T-shirt',
      'Top',
      'Cute',
      'Uniform',
      'School uniform',
      'Ocean',
      'Navy',
      'Tie',
      'Girl',
      'Female',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'sailor',
    description: [
      'Sailor suit',
      'Shirt',
      'T-shirt',
      'Top',
      'Cute',
      'Uniform',
      'School uniform',
      'Ocean',
      'Navy',
      'Tie',
      'Boy',
      'Male',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'skirt',
    description: ['Skirt', 'Bottoms', 'Girl', 'Female'].join(', '),
  },
  {
    type: 'sprite',
    id: 'skull',
    description: [
      'T-shirt',
      'Shirt',
      'Short-sleeved shirt',
      'Skull',
      'Skeleton',
      'Print shirt',
      'Zombie',
      'Spooky',
      'Scary',
      'Halloween',
      'Costume',
      'Goth',
      'Emo',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'spaghetti',
    description: [
      'Tank top',
      'Sleeveless shirt',
      'Top',
      'Hot',
      'Summer',
      'Casual',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'spooky',
    description: [
      'Spooky',
      'Zombie',
      'Ghost',
      'Halloween',
      'Spooky',
      'Scary',
      'Funny',
      'Outfit',
      'Cosplay',
      'Top',
      'Bottoms',
      'Black',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'sporty',
    description: [
      'T-shirt',
      'Shirt',
      'Short-sleeved shirt',
      'Sporty',
      'Jersey',
      'Print shirt',
      'Sports',
      'Jock',
      'Casual',
      'Top',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'stripe',
    description: [
      'T-shirt',
      'Shirt',
      'Short-sleeved shirt',
      'Striped shirt',
      'Stripe',
      'Print shirt',
      'Casual',
      'Top',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'suit',
    description: [
      'Top',
      'Shirt',
      'Jacket',
      'Tie',
      'Suit',
      'Formal',
      'Tuxedo',
      'Long sleeved shirt',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'witch',
    description: [
      'Witch',
      'Mage',
      'Wizard',
      'Purple',
      'Dress',
      'Robe',
      'Halloween',
      'Spooky',
      'Scary',
      'Outfit',
      'Cosplay',
    ].join(', '),
  },
];

export const SPRITE_ACCESSORY: Avatar[] = [
  {
    type: 'sprite',
    id: 'earring_emerald_silver',
    description: ['Earring', 'Earrings', 'Pretty', 'Girly'].join(', '),
  },
  {
    type: 'sprite',
    id: 'earring_emerald',
    description: ['Earring', 'Earrings', 'Pretty', 'Girly'].join(', '),
  },
  {
    type: 'sprite',
    id: 'earring_red_silver',
    description: ['Earring', 'Earrings', 'Pretty', 'Girly'].join(', '),
  },
  {
    type: 'sprite',
    id: 'earring_red',
    description: ['Earring', 'Earrings', 'Pretty', 'Girly'].join(', '),
  },
  {
    type: 'sprite',
    id: 'hat_cowboy',
    description: ['Cowboy', 'Hat', 'Southern', 'Western'].join(', '),
  },
  {
    type: 'sprite',
    id: 'hat_lucky',
    description: ['Leprechaun', 'Hat', 'Irish', 'Clover', 'Lucky'].join(', '),
  },
  {
    type: 'sprite',
    id: 'hat_pumpkin',
    description: ['Pumpkin', 'Hat', 'Halloween', 'Spooky', 'Scary'].join(', '),
  },
  {
    type: 'sprite',
    id: 'beard',
    description: [
      'Beard',
      'Facial hair',
      'Boy',
      'Male',
      'Man',
      'Adult',
      'Hairy',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'glasses_sun',
    description: ['Sunglasses', 'Shades', 'Cool', 'Beach', 'Summer'].join(', '),
  },
  {
    type: 'sprite',
    id: 'glasses',
    description: ['Glasses', 'Spectacles', 'Smart', 'Nerd'].join(', '),
  },
  {
    type: 'sprite',
    id: 'hat_witch',
    description: [
      'Witch',
      'Wizard',
      'Hat',
      'Halloween',
      'Spooky',
      'Scary',
      'Magic',
      'Magical',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'mask_clown_blue',
    description: [
      'Clown',
      'Joker',
      'Mask',
      'Halloween',
      'Spooky',
      'Scary',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'mask_clown_red',
    description: [
      'Clown',
      'Joker',
      'Mask',
      'Halloween',
      'Spooky',
      'Scary',
    ].join(', '),
  },
  {
    type: 'sprite',
    id: 'mask_spooky',
    description: [
      'Ghost',
      'Zombie',
      'Skeleton',
      'Mask',
      'Halloween',
      'Spooky',
      'Scary',
    ].join(', '),
  },
];
