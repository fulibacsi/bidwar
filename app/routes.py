from flask import render_template
from flask import flash
from flask import redirect
from flask import url_for
from flask import request

from flask_login import current_user
from flask_login import login_user
from flask_login import logout_user
from flask_login import login_required

from werkzeug.urls import url_parse

from app import app
from app.models import User
from app.models import Note
from app.models import add_note

from app.forms import AddNote
from app.forms import LoginForm


@app.route('/')
@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('notes'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user is None or not user.check_password(form.password.data):
            flash('Invalid username or password')
            return redirect(url_for('login'))
        login_user(user, remember=form.remember_me.data)
        
        next_page = request.args.get('next')
        if not next_page or url_parse(next_page).netloc != '':
            next_page = url_for('notes')
        return redirect(next_page)
    
    return render_template('login.html', title='Sign In', form=form)


@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('login'))


@app.route('/notes', methods=['GET', 'POST'])
@login_required
def notes():
    form = AddNote()
    if form.validate_on_submit():
        add_note(user_id=current_user.id, body=form.body.data)
        return redirect(url_for('notes'))
    posts = Note.query.all()

    return render_template('notes.html', title='Notes', posts=posts, form=form)
