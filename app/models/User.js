'use strict';

const userModel = (sequelize, DataTypes) =>{
    const User = sequelize.define('user',
        {
            name: {type: DataTypes.STRING, allowNull: false},
            email: {type: DataTypes.STRING, unique: true, allowNull: false },
            password: {type: DataTypes.STRING, allowNull: false},
            admin: DataTypes.BOOLEAN,
            last_login: DataTypes.DATE
        },
        {
            timestamps: true,
            paranoid: true,
            underscored: true,
        });
    User.beforeCreate(user => { user.admin = false });
    User.associate = (models) => {
        User.belongsToMany(models.plan, {through: { model: models.membership, unique: false }});
        User.hasMany(models.search);
        User.hasMany(models.report);
    };

    return User;
};

export default userModel;