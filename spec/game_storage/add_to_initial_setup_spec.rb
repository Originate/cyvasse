require 'minimal_spec_helper'
require ROOT_DIRECTORY + '/app/game_storage/piece.rb'
require ROOT_DIRECTORY + '/app/game_storage/terrain.rb'
require ROOT_DIRECTORY + '/app/game_storage/add_to_initial_setup.rb'

describe AddToInitialSetup do
  let(:add_to_initial_setup) { AddToInitialSetup.new(game, type, attrs) }
  let(:game) { double :game, initial_setup: initial_setup, board: board, save: nil }
  let(:initial_setup) { double :initial_setup, add: nil }
  let(:board) { double :board }
  let(:attrs) { double :attrs }

  let(:object) { double :object, coordinate: coordinate, color: 'alabaster' }
  let(:coordinate) { double :coordinate }

  describe '#call' do
    [Terrain, Piece].each do |klass|
      context klass do
        let(:type) { klass }
        before { type.stub(:new).with(game, attrs).and_return(object) }

        context 'coordinate is invalid' do
          before { board.stub(:coordinate_valid?).with(coordinate).and_return(false) }

          it 'does not add it to the initial_setup' do
            add_to_initial_setup.call
            expect(initial_setup).not_to have_received(:add).with(object)
          end
        end

        context 'coordinate is valid' do
          before { board.stub(:coordinate_valid?).with(coordinate).and_return(true) }

          context 'object in enemy territory' do
            before { board.stub(:territory).with(coordinate).and_return('onyx') }

            it 'does not add it to the initial_setup' do
              add_to_initial_setup.call
              expect(initial_setup).not_to have_received(:add).with(object)
            end
          end

          context 'object in neutral territory' do
            before { board.stub(:territory).with(coordinate).and_return('neutral') }

            it 'does not add it to the initial_setup' do
              add_to_initial_setup.call
              expect(initial_setup).not_to have_received(:add).with(object)
            end
          end

          context 'object in home territory' do
            before { board.stub(:territory).with(coordinate).and_return('alabaster') }

            it 'adds it to the initial_setup' do
              add_to_initial_setup.call
              expect(initial_setup).to have_received(:add).with(object)
              expect(game).to have_received(:save)
            end
          end
        end
      end
    end
  end
end
