
/*import { Client } from 'discord.js';
import { ICommand } from 'wokcommands';

import {Modal, TextInputComponent, showModal } from 'discord-modals'
const discordModals = require('discord-modals')
const modal = new Modal() // We create a Modal
.setCustomId('customid')
.setTitle('Test of Discord-Modals!')
.addComponents(new TextInputComponent() // We create a Text Input Component
.setCustomId('textinput-customid')
.setLabel('Some text Here')
.setStyle('SHORT') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
.setMinLength(4)
.setMaxLength(10)
.setPlaceholder('Write a text here')
.setRequired(true) // If it's required or not)
)
export default {
  category: 'ManagementTools',
  description: 'Checks different backend things.',
  slash: true,
  testOnly: true, //non test commands can take up to one hour to register to all servers using this bot
  guildOnly: true,
  permissions: ['ADMINISTRATOR'],

  init: async (client: Client) => { //this function is invoked whenever the command is run. We are creating an event listener to listen
                                    //to whenever an interaction is created
    await discordModals(client);
    client.on('modalSubmit', (modal) => {

      console.log('Inside Modal')

       if(modal.customId === 'customid'){
        console.log('Inside customid')
        const firstResponse = modal.getTextInputValue('textinput-customid')
        console.log(firstResponse)
        modal.reply('Congrats! Powered by discord-modals.' + `\n\`\`\`${firstResponse}\`\`\``)
        }
    })
  },
  callback: async ({ interaction: msgInt, channel, interaction, client}) =>{

    showModal(modal, {
      client: client, // The showModal() method needs the client to send the modal through the API.
      interaction: interaction // The showModal() method needs the interaction to send the modal with the Interaction ID & Token.
    })

  },
} as ICommand
*/