import { Command, flags } from '@oclif/command';
import { CreateView } from '../../view/create.view';

export class Create extends Command {
  private readonly msg =
    'Use --help to get more information on how to use the create command';

  private readonly view = new CreateView();

  public static flags = {
    help: flags.help({
      char: 'h',
      description: 'Show help for the create command',
    }),
  };

  public static description = 'Create functions and schedules locally';

  public static strict = false;

  public static examples = [
    '> <%= config.bin %> create:function exampleFunction -e controllerbot_messaging_new_conversation',
  ];

  /**
   * Runs the create command and parses the passed functions
   * @returns {Promise<void>} - create command
   * @memberof Function
   */
  public async run(): Promise<void> {
    this.view.showMessage(this.msg);
  }
}
