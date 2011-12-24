class AuthController < ApplicationController
    
    def token
        user = User.where("user_name = ?", params[:user_name]).first;
        token = user.user_name;
        
        response = { :user => user, :token => token };
        
        respond_to do |format|
            format.json  { render :json => response, :status => :ok }
        end
    end
    
end