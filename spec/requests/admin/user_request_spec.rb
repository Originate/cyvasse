require 'spec_helper'

describe 'admin users' do
  before do
    sign_in_admin
  end

  describe 'index' do
    before { create_list :user, 3 }

    it 'succeeds' do
      get '/admin/users'
      expect(response.status).to eql 200
    end
  end

  describe 'new' do
    it 'succeeds' do
      get '/admin/users/new'
      expect(response.status).to eql 200
    end
  end

  describe 'create' do
    let(:valid_attributes) { { username: 'test', email: 'a@b.c', password: '12345678', password_confirmation: '12345678' } }

    it 'creates and redirects' do
      expect {
        post '/admin/users', user: valid_attributes
        expect(response).to redirect_to [:admin, User.last]
      }.to change(User, :count).by(1)
    end
  end

  describe 'edit' do
    let(:user) { create :user }

    it 'succeeds' do
      get "/admin/users/#{user.id}/edit"
      expect(response.status).to eql 200
    end
  end

  describe 'update' do
    let(:user) { create :user, creator: false }

    it 'updates and redirects to user' do
      put "/admin/users/#{user.id}", user: { creator: true }
      expect(user.reload.creator).to eql true
      expect(response).to redirect_to [:admin, user]
    end
  end

  describe 'destroy' do
    let!(:user) { create :user }

    it 'destroys and redirects to users' do
      expect{
        delete "/admin/users/#{user.id}"
        expect(response).to redirect_to [:admin, :users]
      }.to change(User, :count).by(-1)
    end
  end
end
