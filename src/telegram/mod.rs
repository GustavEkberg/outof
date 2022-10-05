use std::error::Error;
use teloxide::{prelude::*, utils::command::BotCommands, types::ParseMode};
use crate::db::{create_items, get_all_items, create_new_list};

#[derive(BotCommands, Clone)]
#[command(rename = "lowercase", description = "I support the following commands:")]
pub enum CommandType {
  #[command(description = "Add new items you are outof")]
  OutOf(String),
  #[command(description = "Generate a new shopping list based on the items you are currently outof")]
  Generate,
  #[command(description = "Display a list of all outof items")]
  List
}

pub async fn setup_bot() {
  let bot = Bot::from_env()
    .auto_send();

  println!("Starting bot...");
  teloxide::commands_repl(bot, response, CommandType::ty()).await;
}

pub async fn response(
  bot: AutoSend<Bot>, 
  message: Message, 
  command: CommandType
) -> Result<(), Box<dyn Error + Send + Sync>> {
  match command {
    CommandType::OutOf(input) => {
      create_items(
        &message.chat.id.to_string(), 
        &input, 
        &message.from().unwrap().full_name()
      );
      bot.send_message(
        message.chat.id, 
        format!("Added items {}", input)
      ).await?
    },
    CommandType::List => {
      bot.send_message(
        message.chat.id, 
        get_all_items(&message.chat.id.to_string())
      ).await?
    }
    CommandType::Generate => {
      bot.parse_mode(ParseMode::MarkdownV2)
        .send_message(
          message.chat.id, 
          create_new_list(&message.chat.id.to_string()).replace("_", "\\_")
        ).await?
    }
  };

  Ok(())
}