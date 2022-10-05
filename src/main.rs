use telegram::setup_bot;
use server::setup_server;

mod telegram;
mod db;
mod list;
mod server;
mod frontend;

#[tokio::main]
async fn main() {

  tokio::spawn(setup_server());
  setup_bot().await;
}