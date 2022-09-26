pub mod commands {
  use std::error::Error;
  use teloxide::{prelude::*, utils::command::BotCommands};
  use crate::db::db_list::{create_items, get_items};

  #[derive(BotCommands, Clone)]
  #[command(rename = "lowercase", description = "I support the following commands:")]
  pub enum CommandType {
    #[command(description = "Add new items you are outof")]
    OutOf(String),
    #[command(description = "Generate a new shopping list based on the items you are currently outof")]
    Generate,
    #[command(description = "Display a list of all outof")]
    List
  }

  pub async fn setup_bot() {
    let bot = Bot::from_env().auto_send();

    teloxide::commands_repl(bot, response, CommandType::ty()).await;
  }

  pub async fn response(bot: AutoSend<Bot>, message: Message, command: CommandType) -> Result<(), Box<dyn Error + Send + Sync>> {
    match command {
      CommandType::OutOf(input) => {
        create_items(&input, message.from().unwrap().full_name());
        bot.send_message(message.chat.id, format!("Added items {input}")).await?
      },
      CommandType::List => {
        bot.send_message(message.chat.id, get_items()).await?
      }
      CommandType::Generate => {
        bot.send_message(message.chat.id, "Generate").await?
      }
    };

    Ok(())
  }


}