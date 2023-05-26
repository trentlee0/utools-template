import {
  NoneTemplate,
  ImmutableListItem,
  ImmutableListTemplate,
  MutableListTemplate,
  templateBuilder,
  Action,
  ListItem,
  ListRenderFunction
} from '../src'

class Test1 implements ImmutableListTemplate {
  code = 'test1'

  list: Array<ImmutableListItem> = [
    {
      title: '',
      description: '',
      handler: () => {
      }
    }
  ]
}

class Test2 implements MutableListTemplate {
  code = 'test2'

  enter(action: Action, render: ListRenderFunction): void {
  }

  select(action: Action, item: ListItem): void {
  }
}

class Test3 implements NoneTemplate {
  code = 'test3'

  handler(action: Action): void {
  }
}

templateBuilder()
  .immutableList(new Test1())
  .mutableList(new Test2())
  .none(new Test3())
  .build()
