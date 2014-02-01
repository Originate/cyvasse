require 'spec_helper'

describe PieceRulesController do
  let!(:variant) { create :variant }

  describe 'new' do
    context 'when signed in', :signed_in do
      context 'for own variant' do
        let(:variant) { create :variant, user: current_user }

        it 'succeeds' do
          get :new, variant_id: variant.id
          response.status.should == 200
        end
      end

      context 'for other variant' do
        it 'redirects to root' do
          get :new, variant_id: variant.id
          response.should redirect_to root_path
        end
      end
    end

    context 'when not signed in' do
      it 'redirects to login' do
        get :new, variant_id: variant.id
        response.should redirect_to new_user_session_path
      end
    end
  end

  describe 'create' do
    let(:piece_type) { create(:piece_type) }
    let(:valid_attributes) { { count_minimum: 1, count_maximum: 1, movement_type: 'orthogonal_line', movement_minimum: 1, movement_maximum: 1, piece_type_id: piece_type.id, capture_type: 'movement'} }

    context 'when signed in', :signed_in do
      context 'for own variant' do
        let(:variant) { create :variant, user: current_user }

        context 'with valid attributes' do
          it 'creates and redirects' do
            expect {
              post :create, variant_id: variant.id, piece_rule: valid_attributes
              response.should redirect_to variant
            }.to change(PieceRule, :count).by(1)
          end
        end

        context 'with invalid attributes' do
          it 'does not create and renders new' do
            expect {
              post :create, variant_id: variant.id, piece_rule: valid_attributes.merge(count_minimum: '')
              response.should render_template 'new'
            }.to change(PieceRule, :count).by(0)
          end
        end
      end

      context 'for other variant' do
        it 'redirects to root' do
          expect {
            post :create, variant_id: variant.id, piece_rule: valid_attributes
            response.should redirect_to root_path
          }.to change(PieceRule, :count).by(0)
        end
      end
    end

    context 'when not signed in' do
      it 'redirects to login' do
        expect {
          post :create, variant_id: variant.id, piece_rule: valid_attributes
          response.should redirect_to new_user_session_path
        }.to change(PieceRule, :count).by(0)
      end
    end
  end

  describe 'edit' do
    let(:piece_rule) { create :piece_rule, variant: variant }

    context 'when signed in', :signed_in do
      context 'for own variant' do
        let(:variant) { create :variant, user: current_user }

        it 'succeeds' do
          get :edit, id: piece_rule.id
          response.status.should == 200
        end
      end

      context 'for other variant' do
        it 'redirects to root' do
          get :edit, id: piece_rule.id
          response.should redirect_to root_path
        end
      end
    end

    context 'when not signed in' do
      it 'redirects to login' do
        get :edit, id: piece_rule.id
        response.should redirect_to new_user_session_path
      end
    end
  end

  describe 'update' do
    let(:piece_rule) { create :piece_rule, variant: variant, count_maximum: 2 }

    context 'when signed in', :signed_in do
      context 'for own variant' do
        let(:variant) { create :variant, user: current_user }

        context 'with valid attributes' do
          it 'updates and redirects to variant' do
            put :update, id: piece_rule.id, piece_rule: { count_maximum: 3 }
            piece_rule.reload.count_maximum.should == 3
            response.should redirect_to variant
          end
        end

        context 'with invalid attributes' do
          it 'renders edit' do
            put :update, id: piece_rule.id, piece_rule: { count_maximum: 0 }
            piece_rule.reload.count_maximum.should == 2
            response.should render_template 'edit'
          end
        end
      end

      context 'for other variant' do
        it 'redirects to root' do
          put :update, id: piece_rule.id, piece_rule: { count_maximum: 3 }
          piece_rule.reload.count_maximum.should == 2
          response.should redirect_to root_path
        end
      end
    end

    context 'when not signed in' do
      it 'redirects to login' do
        put :update, id: piece_rule.id, piece_rule: { count_maximum: 3 }
        piece_rule.reload.count_maximum.should == 2
        response.should redirect_to new_user_session_path
      end
    end
  end

  describe 'destroy' do
    let(:piece_type) { create(:piece_type) }
    let!(:piece_rule) { create :piece_rule, variant: variant, piece_type: piece_type }

    context 'when signed in', :signed_in do
      context 'for own variant' do
        let(:variant) { create :variant, user: current_user }

        context 'piece_type is king' do
          let(:piece_type) { create(:piece_type, name: 'King') }

          it 'does not destroy and redirects to variant' do
            expect{
              delete :destroy, id: piece_rule.id
              response.should redirect_to variant
            }.to change(PieceRule, :count).by(0)
          end
        end

        context 'piece_type is not king' do
          it 'destroys and redirects to variant' do
            expect{
              delete :destroy, id: piece_rule.id
              response.should redirect_to variant
            }.to change(PieceRule, :count).by(-1)
          end
        end
      end

      context 'for other variant' do
        it 'redirects to root_path' do
          expect{
            delete :destroy, id: piece_rule.id
            response.should redirect_to root_path
          }.to change(PieceRule, :count).by(0)
        end
      end
    end

    context 'when not signed in' do
      it 'redirects to login' do
        expect{
          delete :destroy, id: piece_rule.id
          response.should redirect_to new_user_session_path
        }.to change(PieceRule, :count).by(0)
      end
    end
  end
end
